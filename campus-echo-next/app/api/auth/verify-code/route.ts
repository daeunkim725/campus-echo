import { compareSync } from "bcryptjs";
import { db } from "@/lib/db";
import { requireAuth, detectSchoolFromEmail } from "@/lib/auth";
import { safeUser } from "../signup/route";

export async function POST(request: Request) {
    try {
        const { user } = await requireAuth(request);

        const { verification_id, code } = await request.json();

        if (!verification_id || !code) {
            return Response.json({ error: "verification_id and code are required" }, { status: 400 });
        }

        const record = await db.emailVerification.findUnique({
            where: { id: verification_id },
        });

        if (!record || record.user_id !== user.id) {
            return Response.json({ error: "Verification record not found" }, { status: 404 });
        }

        if (record.verified) {
            return Response.json({ error: "Code already used" }, { status: 400 });
        }

        if (new Date() > record.expires_at) {
            return Response.json({ error: "Verification code expired" }, { status: 400 });
        }

        if (!compareSync(code, record.code_hash)) {
            return Response.json({ error: "Invalid verification code" }, { status: 400 });
        }

        // Mark verification record as used
        await db.emailVerification.update({
            where: { id: record.id },
            data: { verified: true },
        });

        // Update user: set school verified
        const detectedSchool = record.school || detectSchoolFromEmail(record.school_email);
        const updatedUser = await db.user.update({
            where: { id: user.id },
            data: {
                school_email: record.school_email,
                school_id: detectedSchool,
                school_verified: true,
                verified_at: new Date(),
            },
        });

        // Seed the School row if it doesn't exist (admin flow)
        if (detectedSchool) {
            await db.school.upsert({
                where: { id: detectedSchool },
                create: { id: detectedSchool, name: detectedSchool, domains: [] },
                update: {},
            });
        }

        return Response.json({
            message: "School email verified successfully",
            user: safeUser(updatedUser),
        });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Verify code error:", err);
        return Response.json({ error: "Verification failed" }, { status: 500 });
    }
}
