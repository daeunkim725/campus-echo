import { db } from "@/lib/db";
import { requireVerified, getAnonId } from "@/lib/auth";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";

// ─── GET /api/posts/[id]/comments ─────────────────────────────────────────

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await requireVerified(request);

        const comments = await db.comment.findMany({
            where: { post_id: params.id, deleted_at: null },
            orderBy: { created_at: "asc" },
        });

        const myAnonId = await getAnonId(user.email);
        const commentIds = comments.map((c) => c.id);
        const myVotes = await db.vote.findMany({
            where: { user_id: user.id, target_type: "comment", target_id: { in: commentIds } },
        });
        const voteMap: Record<string, number> = {};
        for (const v of myVotes) voteMap[v.target_id] = v.vote_value;

        const sanitized = comments.map((c) => ({
            ...c,
            is_own_comment: c.author_anon_id === myAnonId,
            user_vote: voteMap[c.id] ?? 0,
        }));

        return Response.json({ comments: sanitized });
    } catch (err) {
        if (err instanceof Response) return err;
        return Response.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

// ─── POST /api/posts/[id]/comments ────────────────────────────────────────

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await requireVerified(request);
        const ip = request.headers.get("x-forwarded-for") ?? "unknown";
        const limited = checkRateLimit(rateLimitKey("comment_create", ip), 15, 3600000);
        if (limited) return limited;

        const { content } = await request.json();
        if (!content || content.trim().length === 0) {
            return Response.json({ error: "Content is required" }, { status: 400 });
        }

        const post = await db.post.findFirst({ where: { id: params.id, deleted_at: null } });
        if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

        const anonId = await getAnonId(user.email);

        const comment = await db.comment.create({
            data: {
                post_id: params.id,
                author_id: user.id,
                author_anon_id: anonId,
                author_mood: user.mood ?? "chill",
                content: content.trim(),
            },
        });

        await db.post.update({
            where: { id: params.id },
            data: { comment_count: { increment: 1 } },
        });

        return Response.json({ comment }, { status: 201 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Comment create error:", err);
        return Response.json({ error: "Failed to create comment" }, { status: 500 });
    }
}
