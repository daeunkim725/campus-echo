import { db } from "@/lib/db";
import { requireVerified, getAnonId } from "@/lib/auth";

// ─── GET /api/posts/[id] ───────────────────────────────────────────────────

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await requireVerified(request);
        const post = await db.post.findFirst({
            where: { id: params.id, deleted_at: null },
            include: { pollOptions: true },
        });

        if (!post || post.school_id !== user.school_id) {
            return Response.json({ error: "Post not found" }, { status: 404 });
        }

        const myAnonId = await getAnonId(user.email);
        const vote = await db.vote.findFirst({
            where: { user_id: user.id, target_id: post.id },
        });

        return Response.json({
            post: {
                ...post,
                is_own_post: post.author_anon_id === myAnonId,
                user_vote: vote?.vote_value ?? 0,
            },
        });
    } catch (err) {
        if (err instanceof Response) return err;
        return Response.json({ error: "Failed to fetch post" }, { status: 500 });
    }
}

// ─── DELETE /api/posts/[id] — soft-delete ────────────────────────────────

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await requireVerified(request);
        const post = await db.post.findFirst({ where: { id: params.id, deleted_at: null } });

        if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

        const myAnonId = await getAnonId(user.email);
        const isOwner = post.author_id === user.id || post.author_anon_id === myAnonId;
        const isAdmin = user.role === "admin" || user.role === "moderator";

        if (!isOwner && !isAdmin) {
            return Response.json({ error: "Not authorized" }, { status: 403 });
        }

        await db.post.update({ where: { id: params.id }, data: { deleted_at: new Date() } });
        return Response.json({ message: "Post deleted" });
    } catch (err) {
        if (err instanceof Response) return err;
        return Response.json({ error: "Failed to delete post" }, { status: 500 });
    }
}
