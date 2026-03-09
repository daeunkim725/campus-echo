import { requireVerified, checkRateLimit, handleCORS } from './_shared/authMiddleware.ts';

import { withObservability } from './_shared/observability.ts';

const handler = async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user, base44 } = await requireVerified(req);

        const rateLimitResponse = checkRateLimit(req, "poll_vote", 20, 3600000);
        if (rateLimitResponse) return rateLimitResponse;

        if (req.method !== "POST") {
            return Response.json({ error: "METHZod not allowed" }, { status: 405 });
        }

        const body = await req.json();
        const { post_id, option_index } = body;

        if (!post_id || typeof option_index !== "number") {
            return Response.json({ error: "Post ID and option_index are required" }, { status: 400 });
        }

        // Fetch post
        const posts = await base44.asServiceRole.entities.Post.filter({ id: post_id });
        const post = posts[0];

        if (!post || post.deleted_at || post.post_type !== "poll" || !post.poll_options) {
            return Response.json({ error: "Poll not found" }, { status: 404 });
        }

        if (option_index < 0 || option_index >= post.poll_options.length) {
            return Response.json({ error: "Invalid option index" }, { status: 400 });
        }

        // Verify uniqueness
        const existingVotes = await base44.asServiceRole.entities.Vote.filter({
            user_email: user.email,
            target_id: post_id,
            target_type: "poll"
        });

        if (existingVotes.length > 0) {
            return Response.json({ error: "You have already voted on this poll" }, { status: 400 });
        }

        // Register vote
        await base44.asServiceRole.entities.Vote.create({
            user_email: user.email,
            target_type: "poll",
            target_id: post_id,
            vote_value: option_index
        });

        // Update post metrics
        const updatedOptions = [...post.poll_options];
        updatedOptions[option_index] = {
            ...updatedOptions[option_index],
            votes_count: (updatedOptions[option_index].votes_count || 0) + 1
        };

        await base44.asServiceRole.entities.Post.update(post_id, {
            poll_options: updatedOptions
        });

        return Response.json({ success: true, poll_options: updatedOptions }, { status: 200 });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Poll vote error:", err);
        return Response.json({ error: "Failed to cast poll vote" }, { status: 500 });
    }
}

export default withObservability(handler, "pollVote");
