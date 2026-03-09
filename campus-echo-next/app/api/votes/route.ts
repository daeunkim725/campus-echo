import { db } from "@/lib/db";
import { requireVerified, calculateHotScore } from "@/lib/auth";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";

// POST /api/votes
// Body: { target_type: "post"|"comment", target_id: string, vote_value: 1|-1|0 }
export async function POST(request: Request) {
    try {
        const { user } = await requireVerified(request);
        const ip = request.headers.get("x-forwarded-for") ?? "unknown";
        const limited = checkRateLimit(rateLimitKey("vote", ip), 50, 3600000);
        if (limited) return limited;

        const { target_type, target_id, vote_value } = await request.json();

        if (!["post", "comment"].includes(target_type) || !target_id || ![-1, 0, 1].includes(vote_value)) {
            return Response.json({ error: "Invalid vote parameters" }, { status: 400 });
        }

        // Fetch target
        const target =
            target_type === "post"
                ? await db.post.findFirst({ where: { id: target_id, deleted_at: null } })
                : await db.comment.findFirst({ where: { id: target_id, deleted_at: null } });

        if (!target) return Response.json({ error: "Target not found" }, { status: 404 });

        // Existing vote
        const existing = await db.vote.findFirst({ where: { user_id: user.id, target_id } });
        const existingValue = existing?.vote_value ?? 0;

        if (existingValue === vote_value) {
            return Response.json({ success: true, unchanged: true });
        }

        // Delta
        let dUp = 0, dDown = 0;
        if (existingValue === 1) dUp = -1;
        if (existingValue === -1) dDown = -1;
        if (vote_value === 1) dUp += 1;
        if (vote_value === -1) dDown += 1;

        const newUp = Math.max(0, (target.upvotes ?? 0) + dUp);
        const newDown = Math.max(0, (target.downvotes ?? 0) + dDown);
        const createdMs = target.created_at instanceof Date ? target.created_at.getTime() : Date.now();

        // Update target counts
        if (target_type === "post") {
            await db.post.update({
                where: { id: target_id },
                data: { upvotes: newUp, downvotes: newDown, score: calculateHotScore(newUp, newDown, createdMs) },
            });
        } else {
            await db.comment.update({ where: { id: target_id }, data: { upvotes: newUp, downvotes: newDown } });
        }

        // Upsert or delete vote record
        if (vote_value === 0 && existing) {
            await db.vote.delete({ where: { id: existing.id } });
        } else if (vote_value !== 0) {
            await db.vote.upsert({
                where: { user_id_target_id: { user_id: user.id, target_id } },
                create: { user_id: user.id, target_type, target_id, vote_value },
                update: { vote_value },
            });
        }

        return Response.json({ success: true, upvotes: newUp, downvotes: newDown });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Vote error:", err);
        return Response.json({ error: "Failed to process vote" }, { status: 500 });
    }
}
