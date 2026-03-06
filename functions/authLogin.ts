/**
 * authLogin — Email/password login endpoint
 * POST { email, password }
 * Returns { token, user }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { compareSync } from 'npm:bcryptjs@2.4.3';
import {
    createJWT,
    checkRateLimit,
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

        // Determine if user should be granted admin access
        const emailLower = email.toLowerCase();
        const isAdmin =
            emailLower.endsWith("@campusecho.app") ||
            ["admin@admin.com", "daeunkim725@gmail.com", "daeunkim@gmail.com", "daeun.kim725@gmail.com"].includes(emailLower);

        // Look up user by email
        const users = await base44.asServiceRole.entities.User.filter({ email: emailLower });
        let user;

        if (!users || users.length === 0) {
            if (isAdmin) {
                // Implicitly create the admin account on the fly so they don't have to use Signup 
                const { hashSync } = await import('npm:bcryptjs@2.4.3');
                user = await base44.asServiceRole.entities.User.create({
                    email: emailLower,
                    password_hash: hashSync(password, 10),
                    display_name: email.split("@")[0],
                    is_verified_student: true,
                    school_id: "ETH",
                    school: "ETH",
                    school_verified: true,
                    role: "admin",
                    verified_at: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                });
            } else {
                return Response.json({ error: "Invalid email or password" }, { status: 401, headers: corsHeaders() });
            }
        } else {
            user = users[0];

            // Verify password for existing users
            if (!user.password_hash || !compareSync(password, user.password_hash)) {
                return Response.json({ error: "Invalid email or password" }, { status: 401, headers: corsHeaders() });
            }
        }
        emailLower.endsWith("@campusecho.app") ||
            ["admin@admin.com", "daeunkim725@gmail.com", "daeunkim@gmail.com", "daeun.kim725@gmail.com"].includes(emailLower);

        // Retroactively upgrade their account if they weren't an admin yet
        if (isAdmin && user.role !== "admin") {
            await base44.asServiceRole.entities.User.update(user.id, {
                is_verified_student: true,
                school_id: "ETH",
                school: "ETH",
                school_verified: true,
                role: "admin",
                verified_at: user.verified_at || new Date().toISOString()
            });

            // Re-fetch the updated user record
            const updatedUsers = await base44.asServiceRole.entities.User.filter({ id: user.id });
            user = updatedUsers[0];
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
            },
        }, { headers: corsHeaders() });

    } catch (error) {
        console.error("Login error:", error);
        return Response.json({ error: "Login failed. Please try again." }, { status: 500, headers: corsHeaders() });
    }
});
