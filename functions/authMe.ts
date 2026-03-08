/**
 * authMe — Get current authenticated user profile
 * GET with Authorization: Bearer <token>
 * Returns user profile with verification status
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

import { withObservability } from './_shared/observability.ts';
import {
    extractBearerToken,
    verifyJWT,
    corsHeaders,
    handleCORS,
} from './_shared/authMiddleware.ts';

const handler = async (req: Request) => {
    // Handle CORS preflight
    const corsResp = handleCORS(req);
    if (corsResp) return corsResp;

    if (req.method !== "GET" && req.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders() });
    }

    try {
        const token = extractBearerToken(req);
        if (!token) {
            return Response.json({ error: "Authentication required" }, { status: 401, headers: corsHeaders() });
        }

        // Verify JWT
        const payload = await verifyJWT(token);

        const base44 = createClientFromRequest(req);

        // Check if token is denylisted
        try {
            const tokenHash = await hashToken(token);
            const denylisted = await base44.asServiceRole.entities.TokenDenylist.filter({ token_hash: tokenHash });
            if (denylisted && denylisted.length > 0) {
                return Response.json({ error: "Token has been revoked" }, { status: 401, headers: corsHeaders() });
            }
        } catch {
            // If TokenDenylist entity doesn't exist yet, skip the check
        }

        // Fetch the full user record
        const users = await base44.asServiceRole.entities.User.filter({ email: payload.email });
        if (!users || users.length === 0) {
            return Response.json({ error: "User not found" }, { status: 404, headers: corsHeaders() });
        }

        const user = users[0];

        return Response.json({
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            is_verified_student: user.is_verified_student || user.school_verified || false,
            school_id: user.school_id || null,
            school: user.school || null,
            school_verified: user.school_verified || user.is_verified_student || false,
            school_email: user.school_email || null,
            mood: user.mood || null,
            role: user.role || null,
            verified_at: user.verified_at || null,
        }, { headers: corsHeaders() });

    } catch (error) {
        console.error("Auth check error:", error);
        return Response.json({ error: "Invalid or expired token" }, { status: 401, headers: corsHeaders() });
    }
});

async function hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
