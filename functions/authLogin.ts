/**
 * authLogin — Email/password login endpoint
 * POST { email, password }
 * Returns { token, user }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { compareSync } from 'npm:bcryptjs@2.4.3';

import { withObservability } from './_shared/observability.ts';
import {
    createJWT,
    checkRateLimit,
    validateEmail,
    corsHeaders,
    handleCORS,
    generateHandle,
    getAnonId,
} from './_shared/authMiddleware.ts';

const handler = async (req: Request) => {
    // Handle CORS preflight
    const corsResp = handleCORS(req);
    if (corsResp) return corsResp;

    if (req.method !== "POST") {
        return Response.json({ error: "METHZod not allowed" }, { status: 405, headers: corsHeaders() });
    }

    // Rate limit: 10 login attempts per IP per 15 minutes
    const rateLimited = checkRateLimit(req, "login", 10, 15 * 60 * 1000);
    if (rateLimited) return rateLimited;

    try {
        const { email, password } = await req.json();

        // Validate inputs
        if (!email || !password) {
            return Response.json({ error: "Email and password are required" }, { status: 400, headers: corsHeaders() });
        }

        if (!validateEmail(email)) {
            return Response.json({ error: "Invalid email format" }, { status: 400, headers: corsHeaders() });
        }

        const base44 = createClientFromRequest(req);

        // Look up user by email
        const users = await base44.asServiceRole.entities.User.filter({ email: email.toLowerCase() });
        if (!users || users.length === 0) {
            // Use generic message to prevent email enumeration
            return Response.json({ error: "Invalid email or password" }, { status: 401, headers: corsHeaders() });
        }

        let user = users[0];

        // Verify password
        if (!user.password_hash || !compareSync(password, user.password_hash)) {
            return Response.json({ error: "Invalid email or password" }, { status: 401, headers: corsHeaders() });
        }

        // Migrate existing users (missing handle or anon_id)
        let needsUpdate = false;
        const updates: any = {};

        if (!user.handle) {
            let newHandle = "";
            let isUnique = false;
            while (!isUnique) {
                newHandle = generateHandle();
                const existingWithHandle = await base44.asServiceRole.entities.User.filter({ handle: newHandle });
                if (!existingWithHandle || existingWithHandle.length === 0) {
                    isUnique = true;
                }
            }
            updates.handle = newHandle;
            user.handle = newHandle;
            needsUpdate = true;
        }

        if (!user.anon_id) {
            const anonId = await getAnonId(user.email);
            updates.anon_id = anonId;
            user.anon_id = anonId;
            needsUpdate = true;
        }

        if (needsUpdate) {
            await base44.asServiceRole.entities.User.update(user.id, updates);
        }

        // Generate JWT (24h expiry)
        const token = await createJWT(user.id, user.email, 24);

        return Response.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.display_name,
                is_verified_student: user.is_verified_student || user.school_verified || false,
                school_id: user.school_id || null,
                school: user.school || null,
                mood: user.mood || null,
                role: user.role || null,
                school_email: user.school_email || null,
                verified_at: user.verified_at || null,
                handle: user.handle,
                anon_id: user.anon_id,
            },
        }, { headers: corsHeaders() });

    } catch (error) {
        console.error("Login error:", error);
        return Response.json({ error: "Login failed. Please try again." }, { status: 500, headers: corsHeaders() });
    }
};

Deno.serve(withObservability(handler, "authLogin"));
