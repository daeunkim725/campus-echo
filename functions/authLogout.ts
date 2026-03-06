/**
 * authLogout — Invalidate a JWT session
 * POST with Authorization: Bearer <token>
 * Adds the token to a denylist so it can't be reused
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import {
    extractBearerToken,
    verifyJWT,
    corsHeaders,
    handleCORS,
} from './_shared/authMiddleware.ts';

Deno.serve(async (req) => {
    // Handle CORS preflight
    const corsResp = handleCORS(req);
    if (corsResp) return corsResp;

    if (req.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders() });
    }

    try {
        const token = extractBearerToken(req);
        if (!token) {
            return Response.json({ error: "No token provided" }, { status: 400, headers: corsHeaders() });
        }

        // Verify the token is valid before denylisting it
        const payload = await verifyJWT(token);

        const base44 = createClientFromRequest(req);

        // Add token to denylist with its expiry so we can clean up later
        await base44.asServiceRole.entities.TokenDenylist.create({
            token_hash: await hashToken(token),
            user_id: payload.sub,
            expires_at: new Date(payload.exp * 1000).toISOString(),
            created_at: new Date().toISOString(),
        });

        return Response.json({ message: "Logged out successfully" }, { headers: corsHeaders() });

    } catch (error) {
        // Even if token is invalid/expired, logout is idempotent
        return Response.json({ message: "Logged out" }, { headers: corsHeaders() });
    }
});

/**
 * Hash a token for safe storage in the denylist.
 * We don't store raw JWTs in the database.
 */
async function hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
