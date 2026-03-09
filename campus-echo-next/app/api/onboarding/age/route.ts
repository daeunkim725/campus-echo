import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { safeUser } from "../auth/signup/route";

// POST /api/onboarding/age
// Body: { dob: "YYYY-MM-DD" }
export async function POST(request: Request) {
    try {
        const { user } = await requireAuth(request);

        const { dob } = await request.json();
        if (!dob) {
            return Response.json({ error: "Date of birth is required" }, { status: 400 });
        }

        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) {
            return Response.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
        }

        const now = new Date();
        const ageMs = now.getTime() - birthDate.getTime();
        const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);

        let updateData: Record<string, unknown>;

        if (ageYears >= 18) {
            updateData = { age_verified: true, unlock_at: null };
        } else {
            // Calculate 18th birthday
            const unlockAt = new Date(birthDate);
            unlockAt.setFullYear(birthDate.getFullYear() + 18);
            updateData = { age_verified: false, unlock_at: unlockAt };
        }

        const updatedUser = await db.user.update({
            where: { id: user.id },
            data: updateData,
        });

        return Response.json({
            age_verified: updatedUser.age_verified,
            unlock_at: updatedUser.unlock_at,
            user: safeUser(updatedUser),
        });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Age gate error:", err);
        return Response.json({ error: "Failed to process age verification" }, { status: 500 });
    }
}
