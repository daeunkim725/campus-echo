/**
 * Shared auth middleware utilities for Cloud Functions.
 * - JWT verification
 * - User verification gating
 * - In-memory rate limiting
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { create, verify, getNumericDate } from 'npm:djwt@3.0.2';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface JWTPayload {
    sub: string;        // user id
    email: string;
    iat: number;
    exp: number;
}

export interface AuthUser {
    id: string;
    email: string;
    displayName?: string;
    is_verified_student?: boolean;
    school_id?: string;
    school?: string;
    verified_at?: string;
    mood?: string;
    role?: string;
    school_email?: string;
    school_verified?: boolean;
    handle?: string;
    anon_id?: string;
}

// ──────────────────────────────────────────────
// JWT helpers
// ──────────────────────────────────────────────

function getJWTSecret(): CryptoKey | Promise<CryptoKey> {
    const secret = Deno.env.get("JWT_SECRET");
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not set");
    }
    const encoder = new TextEncoder();
    return crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
}

export async function createJWT(userId: string, email: string, expiresInHours = 24): Promise<string> {
    const key = await getJWTSecret();
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        sub: userId,
        email,
        iat: now,
        exp: now + (expiresInHours * 3600),
    };
    return await create({ alg: "HS256", typ: "JWT" }, payload, key);
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
    const key = await getJWTSecret();
    const payload = await verify(token, key) as unknown as JWTPayload;
    return payload;
}

// ──────────────────────────────────────────────
// Extract bearer token from request
// ──────────────────────────────────────────────

export function extractBearerToken(req: Request): string | null {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    return authHeader.slice(7);
}

// ──────────────────────────────────────────────
// Auth requirement middleware
// ──────────────────────────────────────────────

/**
 * Verifies JWT and returns authenticated user.
 * Throws a Response (401) if not authenticated.
 */
export async function requireAuth(req: Request): Promise<{ payload: JWTPayload; base44: ReturnType<typeof createClientFromRequest> }> {
    const token = extractBearerToken(req);
    if (!token) {
        throw Response.json({ error: "Authentication required" }, { status: 401 });
    }

    try {
        const payload = await verifyJWT(token);
        const base44 = createClientFromRequest(req);
        return { payload, base44 };
    } catch (err) {
        throw Response.json({ error: "Invalid or expired token" }, { status: 401 });
    }
}

/**
 * Verifies JWT AND checks is_verified_student === true.
 * Throws 401 (not authenticated) or 403 (not verified).
 */
export async function requireVerified(req: Request): Promise<{ payload: JWTPayload; user: AuthUser; base44: ReturnType<typeof createClientFromRequest> }> {
    const { payload, base44 } = await requireAuth(req);

    // Look up user record to check verification status
    try {
        const users = await base44.asServiceRole.entities.User.filter({ email: payload.email });
        const user = users?.[0];

        if (!user) {
            throw Response.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.school_verified && !user.is_verified_student && user.role !== "admin") {
            throw Response.json({ error: "School verification required" }, { status: 403 });
        }

        return { payload, user, base44 };
    } catch (err) {
        if (err instanceof Response) throw err;
        throw Response.json({ error: "Authorization check failed" }, { status: 500 });
    }
}

// ──────────────────────────────────────────────
// In-memory rate limiter
// ──────────────────────────────────────────────

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit by a given key (e.g., IP address or user ID).
 * @param key unique identifier for the rate limit bucket
 * @param maxRequests maximum number of requests in the window
 * @param windowMs window duration in milliseconds
 * @returns true if the request is allowed, false if rate limited
 */
export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (entry.count >= maxRequests) {
        return false;
    }

    entry.count++;
    return true;
}

/**
 * Checks rate limit and returns a 429 Response if exceeded.
 */
export function checkRateLimit(req: Request, namespace: string, maxRequests: number, windowMs: number): Response | null {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || req.headers.get("x-real-ip")
        || "unknown";
    const key = `${namespace}:${ip}`;

    if (!rateLimit(key, maxRequests, windowMs)) {
        return Response.json(
            { error: "Too many requests. Please try again later." },
            {
                status: 429,
                headers: {
                    "Retry-After": String(Math.ceil(windowMs / 1000)),
                    ...corsHeaders()
                }
            }
        );
    }
    return null;
}

// ──────────────────────────────────────────────
// Password validation
// ──────────────────────────────────────────────

export function validatePassword(password: string): string | null {
    if (!password || password.length < 8) {
        return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter";
    }
    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number";
    }
    return null; // valid
}

export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ──────────────────────────────────────────────
// School domain allowlist
// ──────────────────────────────────────────────

export const SCHOOL_DOMAINS: Record<string, string[]> = {
    ETH: ["@ethz.ch", "@student.ethz.ch"],
    EPFL: ["@epfl.ch"],
    UNIZH: ["@uzh.ch", "@student.uzh.ch"],
    UNIBASEL: ["@unibas.ch"],
    UNIBE: ["@unibe.ch", "@students.unibe.ch"],
    UNIL: ["@unil.ch"],
    UNIFR: ["@unifr.ch"],
    UNIGE: ["@unige.ch", "@etu.unige.ch"],
    UNISG: ["@unisg.ch", "@student.unisg.ch"],
    USI: ["@usi.ch", "@student.usi.ch"],
    UNILU: ["@unilu.ch", "@student.unilu.ch"],
};

export function isValidSchoolEmail(email: string, schoolCode: string): boolean {
    const emailLower = email.toLowerCase();
    const isAdmin =
        emailLower.endsWith("@campusecho.app") ||
        ["admin@admin.com", "daeunkim725@gmail.com", "daeunkim@gmail.com", "daeun.kim725@gmail.com"].includes(emailLower);

    if (isAdmin) return true;

    const domains = SCHOOL_DOMAINS[schoolCode];
    if (!domains) return false;
    return domains.some(d => emailLower.endsWith(d));
}

export function getSchoolForEmail(email: string): string | null {
    for (const [code, domains] of Object.entries(SCHOOL_DOMAINS)) {
        if (domains.some(d => email.toLowerCase().endsWith(d))) {
            return code;
        }
    }
    return null;
}

// ──────────────────────────────────────────────
// CORS helper
// ──────────────────────────────────────────────

export function corsHeaders(): Record<string, string> {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-App-Id",
    };
}

export function handleCORS(req: Request): Response | null {
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }
    return null;
}

// ──────────────────────────────────────────────
// Handle Generation
// ──────────────────────────────────────────────

export function generateHandle(): string {
    const digits = Math.floor(100 + Math.random() * 900).toString(); // 3 digits (100-999) - technically 1-9 is what was asked, but let's do 100-999 to guarantee 3 digits
    // Actually the prompt says: "1 leading #bat, then 3 digits 1-9, then 1 letter a-z"
    // So each digit should be 1-9.
    const digit1 = Math.floor(1 + Math.random() * 9).toString();
    const digit2 = Math.floor(1 + Math.random() * 9).toString();
    const digit3 = Math.floor(1 + Math.random() * 9).toString();
    const letter = String.fromCharCode(97 + Math.floor(Math.random() * 26)); // a-z
    return `#bat${digit1}${digit2}${digit3}${letter}`;
}

// ──────────────────────────────────────────────
// Anonymity hashing
// ──────────────────────────────────────────────

/**
 * Deterministically hash an email to generate a persistent anonymous ID for a user.
 * This guarantees users have a consistent "author_anon_id" without exposing their email.
 */
export async function getAnonId(email: string): Promise<string> {
    const salt = Deno.env.get("JWT_SECRET") || "fallback_campus_echo_salt";
    const msg = new TextEncoder().encode(email + salt);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msg);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

