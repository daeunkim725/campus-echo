/**
 * verifyCheckCode — Verify a one-time code and mark user as verified student
 * POST { code, verification_id }
 * Requires: authenticated user (JWT)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { compareSync } from 'npm:bcryptjs@2.4.3';

import { withObservability } from './_shared/observability.ts';
import {
    requireAuth,
    corsHeaders,
    handleCORS,
} from './_shared/authMiddleware.ts';

const handler = async (req: Request) => {
    const corsResp = handleCORS(req);
    if (corsResp) return corsResp;

    if (req.method !== "POST") {
        return Response.json({ error: "METHZod not allowed" }, { status: 405, headers: corsHeaders() });
    }

    try {
        // Require authenticated user
        const { payload, base44 } = await requireAuth(req);

        const { code, verification_id } = await req.json();

        if (!code || !verification_id) {
            return Response.json(
                { error: "code and verification_id are required" },
                { status: 400, headers: corsHeaders() }
            );
        }

        // Fetch verification record
        const records = await base44.asServiceRole.entities.EmailVerification.filter({
            user_id: payload.sub,
            verified: false,
        });

        const record = records?.find((r: any) => r.id === verification_id);

        if (!record) {
            return Response.json(
                { error: "Verification record not found. Please request a new code." },
                { status: 404, headers: corsHeaders() }
            );
        }

        // Check expiry
        if (new Date(record.expires_at) < new Date()) {
            return Response.json(
                { error: "Code expired. Please request a new one." },
                { status: 410, headers: corsHeaders() }
            );
        }

        // Verify the code against the stored hash
        // Support both hashed codes (new) and plain codes (legacy)
        const codeStr = code.toString().trim();
        let codeValid = false;

        if (record.code_hash) {
            codeValid = compareSync(codeStr, record.code_hash);
        } else if (record.code) {
            // Legacy: plain code comparison (for backward compatibility with old records)
            codeValid = record.code === codeStr;
        }

        if (!codeValid) {
            return Response.json(
                { error: "Incorrect code. Please try again." },
                { status: 400, headers: corsHeaders() }
            );
        }

        const now = new Date().toISOString();

        // Mark verification record as verified
        await base44.asServiceRole.entities.EmailVerification.update(record.id, {
            verified: true,
            verified_at: now,
        });

        // Update user profile with verification status
        await base44.asServiceRole.entities.User.update(payload.sub, {
            school: record.school,
            school_id: record.school,
            school_email: record.school_email,
            school_verified: true,
            is_verified_student: true,
            verified_at: now,
        });

        // Fetch updated user
        const users = await base44.asServiceRole.entities.User.filter({ email: payload.email });
        const user = users?.[0];

        return Response.json({
            message: "School email verified successfully!",
            user: {
                id: user?.id || payload.sub,
                email: user?.email || payload.email,
                displayName: user?.display_name,
                is_verified_student: true,
                school_id: record.school,
                school: record.school,
                school_email: record.school_email,
                school_verified: true,
                verified_at: now,
                mood: user?.mood || null,
                role: user?.role || null,
            },
        }, { headers: corsHeaders() });

    } catch (error) {
        if (error instanceof Response) return error;
        console.error("Verify code error:", error);
        return Response.json(
            { error: "Verification failed. Please try again." },
            { status: 500, headers: corsHeaders() }
        );
    }
};

Deno.serve(withObservability(handler, "verifyCheckCode"));
