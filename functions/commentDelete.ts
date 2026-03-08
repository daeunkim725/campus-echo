import { requireVerified, handleCORS } from './_shared/authMiddleware.ts';

import { withObservability } from './_shared/observability.ts';

const handler = async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user, base44 } = await requireVerified(req);

        if (req.method !== "DELETE") {
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        }

        const url = new URL(req.url);
        const commentId = url.searchParams.get("id");

        if (!commentId) {
            return Response.json({ error: "Comment ID is required" }, { status: 400 });
        }

        const comments = await base44.asServiceRole.entities.Comment.filter({ id: commentId });
        const comment = comments[0];

        if (!comment) {
            return Response.json({ error: "Comment not found" }, { status: 404 });
        }

        // Verify ownership
        if (comment.author_email !== user.email && user.role !== "admin") {
            return Response.json({ error: "Unauthorized to delete this comment" }, { status: 403 });
        }

        // Soft delete
        await base44.asServiceRole.entities.Comment.update(commentId, {
            deleted_at: Date.now()
        });

        // Decrement comment count on post
        if (comment.post_id) {
            const posts = await base44.asServiceRole.entities.Post.filter({ id: comment.post_id });
            const post = posts[0];
            if (post) {
                await base44.asServiceRole.entities.Post.update(post.id, {
                    comment_count: Math.max(0, (post.comment_count || 1) - 1)
                });
            }
        }

        return Response.json({ success: true }, { status: 200 });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Comment delete error:", err);
        return Response.json({ error: "Failed to delete comment" }, { status: 500 });
    }
}

export default withObservability(handler, "commentDelete");
