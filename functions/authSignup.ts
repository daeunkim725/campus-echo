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


function generateRandomHandle() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    let letters = '';
    let digits = '';
    for (let i = 0; i < 1; i++) letters += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 3; i++) digits += nums.charAt(Math.floor(Math.random() * nums.length));

    // Mix 1 letter and 3 numbers
    const mixed = (letters + digits).split('').sort(() => 0.5 - Math.random()).join('');
    return `#bat${mixed}`;
}

async function getUniqueLeaderboardHandle(base44) {
    let handle;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
        handle = generateRandomHandle();
        const existing = await base44.asServiceRole.entities.User.filter({ leaderboard_handle: handle });
        if (!existing || existing.length === 0) {
            isUnique = true;
        }
        attempts++;
    }
    return handle;
}

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

        // Determine if user should be granted admin access
        const emailLower = email.toLowerCase();
        const isAdmin =
            emailLower.endsWith("@campusecho.app") ||
            ["admin@admin.com", "daeunkim725@gmail.com", "daeunkim@gmail.com", "daeun.kim725@gmail.com"].includes(emailLower);

        const leaderboardHandle = await getUniqueLeaderboardHandle(base44);
        // Create user record
        const user = await base44.asServiceRole.entities.User.create({
            leaderboard_handle: leaderboardHandle,
            email: emailLower,
            password_hash: passwordHash,
            display_name: displayName || email.split("@")[0],
            is_verified_student: isAdmin, // Auto-verify admins
            school_id: isAdmin ? "ETH" : null,
            school: isAdmin ? "ETH" : null,
            school_verified: isAdmin,
            role: isAdmin ? "admin" : "user",
            verified_at: isAdmin ? new Date().toISOString() : null,
            created_at: new Date().toISOString(),
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
            },
        }, { status: 201, headers: corsHeaders() });

    } catch (error) {
        console.error("Signup error:", error);
        return Response.json({ error: "Registration failed. Please try again." }, { status: 500, headers: corsHeaders() });
    }
});
