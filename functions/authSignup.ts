/**
 * authSignup — Email/password registration endpoint
 * POST { email, password, displayName }
 * Returns { token, user }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { hashSync } from 'npm:bcryptjs@2.4.3';

import { withObservability } from './_shared/observability.ts';
import {
    createJWT,
    checkRateLimit,
    validatePassword,
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

        // Determine if user should be granted admin access
        const emailLower = email.toLowerCase();
        const isAdmin =
            emailLower.endsWith("@campusecho.app") ||
            ["admin@admin.com", "daeunkim725@gmail.com", "daeunkim@gmail.com", "daeun.kim725@gmail.com"].includes(emailLower);

        // Generate a unique handle
        let newHandle = "";
        let isUnique = false;
        while (!isUnique) {
            newHandle = generateHandle();
            const existingWithHandle = await base44.asServiceRole.entities.User.filter({ handle: newHandle });
            if (!existingWithHandle || existingWithHandle.length === 0) {
                isUnique = true;
            }
        }

        const anonId = await getAnonId(emailLower);

        // Create user record
        const user = await base44.asServiceRole.entities.User.create({
            email: emailLower,
            password_hash: passwordHash,
            display_name: displayName || email.split("@")[0],
            is_verified_student: isAdmin, // Auto-verify admins
            school_id: isAdmin ? "ETHZ" : null,
            school: isAdmin ? "ETHZ" : null,
            school_verified: isAdmin,
            role: isAdmin ? "admin" : "user",
            verified_at: isAdmin ? new Date().toISOString() : null,
            created_at: new Date().toISOString(),
            handle: newHandle,
            anon_id: anonId,
        });

        // Generate JWT
        const token = await createJWT(user.id, emailLower);

        return Response.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.display_name,
                is_verified_student: user.is_verified_student,
                school_id: user.school_id,
                school: user.school,
                role: user.role,
                school_verified: user.school_verified,
                handle: user.handle,
                anon_id: user.anon_id,
            },
        }, { status: 201, headers: corsHeaders() });

    } catch (error) {
        console.error("Signup error:", error);
        return Response.json({ error: "Registration failed. Please try again." }, { status: 500, headers: corsHeaders() });
    }
};

Deno.serve(withObservability(handler, "authSignup"));
