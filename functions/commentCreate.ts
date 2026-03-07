import { requireVerified, checkRateLimit, handleCORS, getAnonId } from './_shared/authMiddleware.ts';

import { withObservability } from './_shared/observability.ts';

const handler = async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user, base44 } = await requireVerified(req);

        // Rate limit: 15 comments per hour
        const rateLimitResponse = checkRateLimit(req, "comment_create", 15, 3600000);
        if (rateLimitResponse) return rateLimitResponse;

        if (req.method !== "POST") {
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        }

        const body = await req.json();
        const { post_id, content } = body;

        if (!post_id || !content || typeof content !== "string" || content.trim().length === 0) {
            return Response.json({ error: "Post ID and content are required" }, { status: 400 });
        }

        // Verify post exists and is not deleted
        const posts = await base44.asServiceRole.entities.Post.filter({ id: post_id });
        const post = posts[0];

        if (!post || post.deleted_at) {
            return Response.json({ error: "Post not found" }, { status: 404 });
        }

        // Generate consistent anonymous ID
        const anonId = await getAnonId(user.email);

        const newComment = await base44.entities.Comment.create({
            post_id,
            author_email: user.email,
            author_anon_id: anonId,
            author_mood: user.mood || "chill",
            content: content.trim(),
            upvotes: 0,
            downvotes: 0,
            reported_count: 0,
            created_at: Date.now(),
            deleted_at: null
        });

        // Increment post comment count
        await base44.asServiceRole.entities.Post.update(post_id, {
            comment_count: (post.comment_count || 0) + 1
        });

        const safeComment = { ...newComment };
        delete safeComment.author_email;

        return Response.json({ comment: safeComment }, { status: 201 });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Comment create error:", err);
        return Response.json({ error: "Failed to create comment" }, { status: 500 });
    }
}

export default withObservability(handler, "commentCreate");
