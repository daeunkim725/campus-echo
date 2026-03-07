import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { requireVerified, checkRateLimit, handleCORS, getAnonId } from './_shared/authMiddleware.ts';

import { withObservability } from './_shared/observability.ts';

const handler = async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user, base44 } = await requireVerified(req);

        // Rate limit: 5 posts per hour
        const rateLimitResponse = checkRateLimit(req, "feed_create", 5, 3600000);
        if (rateLimitResponse) return rateLimitResponse;

        if (req.method !== "POST") {
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        }

        const body = await req.json();
        const { content, category, post_type, poll_options, parent_post_id } = body;

        let type = post_type;
        if (["poll", "text", "repost", "quote"].indexOf(type) === -1) {
            type = "text";
        }

        if (type !== "repost" && (!content || typeof content !== "string" || content.trim().length === 0)) {
            return Response.json({ error: "Content is required" }, { status: 400 });
        }

        let validPollOptions = null;
        if (type === "poll") {
            if (!Array.isArray(poll_options) || poll_options.length < 2) {
                return Response.json({ error: "Polls require at least two options" }, { status: 400 });
            }
            validPollOptions = poll_options.slice(0, 4).map((opt, i) => ({
                id: i.toString(),
                text: String(opt).substring(0, 50).trim(),
                votes_count: 0
            }));
        }

        let root_post_id = null;
        if ((type === "repost" || type === "quote") && parent_post_id) {
            const parentPost = await base44.entities.Post.get(parent_post_id);
            if (!parentPost || parentPost.deleted_at) {
                return Response.json({ error: "Parent post not found or deleted" }, { status: 404 });
            }
            // Set root_post_id to parent's root_post_id if it exists, otherwise to the parent's own ID
            root_post_id = parentPost.root_post_id || parentPost.id;

            // Increment the respective counter on the root post
            const rootPost = parentPost.id === root_post_id ? parentPost : await base44.entities.Post.get(root_post_id);
            if (rootPost) {
                 if (type === "repost") {
                     await base44.entities.Post.update(root_post_id, {
                         repost_count: (rootPost.repost_count || 0) + 1
                     });
                 } else if (type === "quote") {
                     await base44.entities.Post.update(root_post_id, {
                         quote_count: (rootPost.quote_count || 0) + 1
                     });
                 }
            }
        }

        // Generate consistent anonymous ID for this user via hash
        const anonId = await getAnonId(user.email);

        const newPost = await base44.entities.Post.create({
            school_id: user.school || "ETH",
            author_email: user.email,         // Internal (never returned to clients)
            author_anon_id: anonId,
            author_mood: user.mood || "chill",
            content: content ? content.trim() : "",
            category: category || "general",
            post_type: type,
            poll_options: validPollOptions,
            parent_post_id: parent_post_id || null,
            root_post_id: root_post_id,
            upvotes: 0,
            downvotes: 0,
            comment_count: 0,
            repost_count: 0,
            quote_count: 0,
            score: 0,                         // Computed for "hot" sort
            reported_count: 0,
            created_at: Date.now(),
            deleted_at: null
        });

        // Strip the real email before returning
        const safePost = { ...newPost };
        delete safePost.author_email;

        return Response.json({ post: safePost }, { status: 201 });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Feed create error:", err);
        return Response.json({ error: "Failed to create post" }, { status: 500 });
    }
}

export default withObservability(handler, "feedCreate");
