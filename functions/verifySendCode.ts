/**
 * verifySendCode — Send a one-time verification code to a school email
 * POST { school_email, school_code }
 * Requires: authenticated user (JWT)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { hashSync } from 'npm:bcryptjs@2.4.3';

import { withObservability } from './_shared/observability.ts';
import {
    requireAuth,
    isValidSchoolEmail,
    SCHOOL_DOMAINS,
    corsHeaders,
    handleCORS,
    rateLimit,
} from './_shared/authMiddleware.ts';

const handler = async (req: Request) => {
    const corsResp = handleCORS(req);
    if (corsResp) return corsResp;

    if (req.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders() });
    }

    try {
        // Require authenticated user
        const { payload, base44 } = await requireAuth(req);

        // Rate limit: 3 code requests per user per hour
        const userKey = `verify-send:${payload.sub}`;
        if (!rateLimit(userKey, 3, 60 * 60 * 1000)) {
            return Response.json(
                { error: "Too many verification requests. Please try again in an hour." },
                { status: 429, headers: corsHeaders() }
            );
        }

        const { school_email, school_code } = await req.json();

        if (!school_email || !school_code) {
            return Response.json(
                { error: "school_email and school_code are required" },
                { status: 400, headers: corsHeaders() }
            );
        }

        // Validate school code exists
        if (!SCHOOL_DOMAINS[school_code]) {
            return Response.json(
                { error: `Unknown school code: ${school_code}` },
                { status: 400, headers: corsHeaders() }
            );
        }

        // Validate email domain matches the selected school
        if (!isValidSchoolEmail(school_email, school_code)) {
            const domains = SCHOOL_DOMAINS[school_code].join(" or ");
            return Response.json(
                { error: `Please use a valid ${school_code} email (${domains})` },
                { status: 400, headers: corsHeaders() }
            );
        }

        // Generate 6-digit OTP code
        const randomValues = new Uint32Array(1);
        crypto.getRandomValues(randomValues);
        const plainCode = (100000 + (randomValues[0] % 900000)).toString();
        const codeHash = hashSync(plainCode, 6); // lower rounds for OTP — 15min expiry anyway
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        // Store verification record (hash only — raw code never persisted)
        const record = await base44.asServiceRole.entities.EmailVerification.create({
            user_id: payload.sub,
            school_email: school_email.toLowerCase(),
            school: school_code,
            code_hash: codeHash,
            verified: false,
            expires_at: expiresAt,
            created_at: new Date().toISOString(),
        });

        // Send email with the plain code
        await base44.asServiceRole.integrations.Core.SendEmail({
            to: school_email.toLowerCase(),
            subject: "Verify your school email — Campus Echo",
            body: [
                "Hi!",
                "",
                "Your verification code for Campus Echo is:",
                "",
                `    ${plainCode}`,
                "",
                "This code expires in 15 minutes.",
                "",
                "If you didn't request this, please ignore this email.",
            ].join("\n"),
        });

        return Response.json({
            verification_id: record.id,
            message: "Verification code sent. Check your email.",
            expires_at: expiresAt,
        }, { status: 200, headers: corsHeaders() });

    } catch (error) {
        if (error instanceof Response) return error;
        console.error("Send code error:", error);
        return Response.json(
            { error: "Failed to send verification code. Please try again." },
            { status: 500, headers: corsHeaders() }
        );
    }
};

Deno.serve(withObservability(handler, "verifySendCode"));
