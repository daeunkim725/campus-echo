import { db } from "@/lib/db";
import { requireVerified } from "@/lib/auth";

const ALLOWED_TYPES = ["post", "comment", "listing"];

// POST /api/reports
export async function POST(request: Request) {
    try {
        const { user } = await requireVerified(request);
        const { target_type, target_id, reason } = await request.json();

        if (!ALLOWED_TYPES.includes(target_type) || !target_id || !reason) {
            return Response.json({ error: "target_type, target_id, and reason are required" }, { status: 400 });
        }

        // Verify target exists
        let exists = false;
        if (target_type === "post") {
            exists = !!(await db.post.findFirst({ where: { id: target_id, deleted_at: null } }));
        } else if (target_type === "comment") {
            exists = !!(await db.comment.findFirst({ where: { id: target_id, deleted_at: null } }));
        } else if (target_type === "listing") {
            exists = !!(await db.listing.findFirst({ where: { id: target_id, deleted_at: null } }));
        }
        if (!exists) return Response.json({ error: "Target not found" }, { status: 404 });

        // Increment reported_count on the target
        const countIncrement = { reported_count: { increment: 1 } };
        if (target_type === "post") await db.post.update({ where: { id: target_id }, data: countIncrement });
        if (target_type === "comment") await db.comment.update({ where: { id: target_id }, data: countIncrement });
        if (target_type === "listing") await db.listing.update({ where: { id: target_id }, data: countIncrement });

        const report = await db.report.create({
            data: { reporter_id: user.id, target_type, target_id, reason },
        });

        return Response.json({ report }, { status: 201 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Report error:", err);
        return Response.json({ error: "Failed to create report" }, { status: 500 });
    }
}
