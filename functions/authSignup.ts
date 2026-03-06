/**
 * authSignup — Email/password registration endpoint
 * POST { email, password, displayName }
 * Returns { token, user }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { hashSync } from 'npm:bcryptjs@2.4.3';
import {
    createJWT,
    checkRateLimit,
    validatePassword,
    validateEmail,
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

    // Rate limit: 5 signups per IP per 15 minutes
    const rateLimited = checkRateLimit(req, "signup", 5, 15 * 60 * 1000);
    if (rateLimited) return rateLimited;

    try {
        const { email, password, displayName } = await req.json();

        // Validate inputs
        if (!email || !password) {
            return Response.json({ error: "Email and password are required" }, { status: 400, headers: corsHeaders() });
        }

        if (!validateEmail(email)) {
            return Response.json({ error: "Invalid email format" }, { status: 400, headers: corsHeaders() });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return Response.json({ error: passwordError }, { status: 400, headers: corsHeaders() });
        }

        const base44 = createClientFromRequest(req);

        // Check if user already exists
        const existingUsers = await base44.asServiceRole.entities.User.filter({ email: email.toLowerCase() });
        if (existingUsers && existingUsers.length > 0) {
            return Response.json({ error: "An account with this email already exists" }, { status: 409, headers: corsHeaders() });
        }

        // Hash password
        const passwordHash = hashSync(password, 10);

        // Create user record
        const user = await base44.asServiceRole.entities.User.create({
            email: email.toLowerCase(),
            password_hash: passwordHash,
            display_name: displayName || email.split("@")[0],
            is_verified_student: false,
            school_id: null,
            school: null,
            school_verified: false,
            verified_at: null,
            created_at: new Date().toISOString(),
        });

        // Generate JWT
        const token = await createJWT(user.id, email.toLowerCase());

        return Response.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.display_name,
                is_verified_student: false,
                school_id: null,
                school: null,
            },
        }, { status: 201, headers: corsHeaders() });

    } catch (error) {
        console.error("Signup error:", error);
        return Response.json({ error: "Registration failed. Please try again." }, { status: 500, headers: corsHeaders() });
    }
});
