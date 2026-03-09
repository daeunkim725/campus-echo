import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET ?? "fallback-dev-secret-min-32-chars-long"
);

export const COOKIE_NAME = "campus_echo_token";

// ─── School domain config ────────────────────────────────────────────────────

export const SCHOOL_DOMAINS: Record<string, string[]> = {
    ETHZ: ["ethz.ch", "student.ethz.ch"],
    UZH: ["uzh.ch", "access.uzh.ch"],
    EPFL: ["epfl.ch"],
};

export function isValidSchoolEmail(email: string, schoolCode: string): boolean {
    const domains = SCHOOL_DOMAINS[schoolCode];
    if (!domains) return false;
    const domain = email.split("@")[1]?.toLowerCase();
    return domains.map((d) => d.toLowerCase()).includes(domain ?? "");
}

export function detectSchoolFromEmail(email: string): string | null {
    const domain = email.split("@")[1]?.toLowerCase() ?? "";
    for (const [school, domains] of Object.entries(SCHOOL_DOMAINS)) {
        if (domains.map((d) => d.toLowerCase()).includes(domain)) return school;
    }
    return null;
}

// ─── JWT helpers ─────────────────────────────────────────────────────────────

export interface TokenPayload extends JWTPayload {
    userId: string;
    email: string;
    schoolId: string | null;
}

export async function createJWT(
    userId: string,
    email: string,
    schoolId: string | null,
    expiryHours = 24
): Promise<string> {
    return new SignJWT({ userId, email, schoolId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${expiryHours}h`)
        .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload;
}

export async function hashToken(token: string): Promise<string> {
    const data = new TextEncoder().encode(token);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

// ─── Anonymous ID — deterministic SHA-256 of email ───────────────────────────

export async function getAnonId(email: string): Promise<string> {
    const data = new TextEncoder().encode("ce:" + email.toLowerCase());
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .substring(0, 16);
}

// ─── Handle generator ────────────────────────────────────────────────────────

const ADJECTIVES = ["swift", "brave", "calm", "dark", "epic", "fast", "gold", "jade", "keen", "lunar"];
const NOUNS = ["bat", "echo", "fox", "hawk", "iris", "jade", "kite", "lynx", "mist", "nova"];

export function generateHandle(): string {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${adj}_${noun}_${num}`;
}

// ─── Auth extraction helpers ──────────────────────────────────────────────────

export function extractToken(request: Request): string | null {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }
    // Also check cookie
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
        const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
        if (match) return match[1];
    }
    return null;
}

export async function requireAuth(request: Request) {
    const token = extractToken(request);
    if (!token) {
        throw Response.json({ error: "Authentication required" }, { status: 401 });
    }

    let payload: TokenPayload;
    try {
        payload = await verifyJWT(token);
    } catch {
        throw Response.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Check denylist
    const tokenHash = await hashToken(token);
    const denylisted = await db.tokenDenylist.findUnique({ where: { token_hash: tokenHash } });
    if (denylisted) {
        throw Response.json({ error: "Token has been revoked" }, { status: 401 });
    }

    // Load user
    const user = await db.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
        throw Response.json({ error: "User not found" }, { status: 401 });
    }

    return { user, token, payload };
}

export async function requireVerified(request: Request) {
    const { user, token, payload } = await requireAuth(request);

    if (!user.school_verified) {
        throw Response.json(
            { error: "School email not verified. Please complete onboarding." },
            { status: 403 }
        );
    }

    if (!user.age_verified) {
        throw Response.json(
            { error: "Age not verified. Please complete onboarding." },
            { status: 403 }
        );
    }

    return { user, token, payload };
}

// ─── Validation helpers ───────────────────────────────────────────────────────

export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): string | null {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain a number";
    return null;
}

// ─── Admin email check ────────────────────────────────────────────────────────

const ADMIN_EMAILS = new Set([
    "admin@campusecho.app",
    "daeunkim725@gmail.com",
    "daeunkim@gmail.com",
    "daeun.kim725@gmail.com",
]);
const ADMIN_DOMAIN = "@campusecho.app";

export function isAdminEmail(email: string): boolean {
    const lower = email.toLowerCase();
    return lower.endsWith(ADMIN_DOMAIN) || ADMIN_EMAILS.has(lower);
}

// ─── Hot score (identical to existing formula) ────────────────────────────────

export function calculateHotScore(up: number, down: number, createdAtMs: number): number {
    const ageHours = (Date.now() - createdAtMs) / (1000 * 60 * 60);
    return (up - down) / Math.pow(ageHours + 2, 1.5);
}
