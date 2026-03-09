import { hashSync } from "bcryptjs";
import { db } from "@/lib/db";
import { requireAuth, isValidSchoolEmail, SCHOOL_DOMAINS } from "@/lib/auth";
import { sendVerificationCode } from "@/lib/email";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";

export async function POST(request: Request) {
    try {
        const { user } = await requireAuth(request);

        // Rate limit: 3 sends per user per hour
        const limited = checkRateLimit(rateLimitKey("verify-send", user.id), 3, 60 * 60 * 1000);
        if (limited) return limited;

        const { school_email, school_code } = await request.json();

        if (!school_email || !school_code) {
            return Response.json({ error: "school_email and school_code are required" }, { status: 400 });
        }

        if (!SCHOOL_DOMAINS[school_code]) {
            return Response.json({ error: `Unknown school code: ${school_code}` }, { status: 400 });
        }

        if (!isValidSchoolEmail(school_email, school_code)) {
            const domains = SCHOOL_DOMAINS[school_code].join(" or ");
            return Response.json(
                { error: `Please use a valid ${school_code} email (${domains})` },
                { status: 400 }
            );
        }

        // Generate 6-digit OTP
        const plainCode = Math.floor(100000 + Math.random() * 900000).toString();
        const codeHash = hashSync(plainCode, 6); // fewer rounds — it's short-lived
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const record = await db.emailVerification.create({
            data: {
                user_id: user.id,
                school_email: school_email.toLowerCase(),
                school: school_code,
                code_hash: codeHash,
                verified: false,
                expires_at: expiresAt,
            },
        });

        await sendVerificationCode(school_email.toLowerCase(), plainCode);

        return Response.json({
            verification_id: record.id,
            message: "Verification code sent. Check your email.",
            expires_at: expiresAt.toISOString(),
        });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Send code error:", err);
        return Response.json({ error: "Failed to send verification code." }, { status: 500 });
    }
}
