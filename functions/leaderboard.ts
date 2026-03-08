import { requireVerified, handleCORS } from './_shared/authMiddleware.ts';
import { withObservability } from './_shared/observability.ts';

const handler = async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user, base44 } = await requireVerified(req);

        if (req.method !== "GET") {
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        }

        // Restrict this endpoint to admins only
        if (user.role !== "admin") {
            return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch posts and comments concurrently
        const [posts, comments] = await Promise.all([
            base44.asServiceRole.entities.Post.filter({}),
            base44.asServiceRole.entities.Comment.filter({})
        ]);

        const userScores: Record<string, number> = {};

        // Process posts
        for (const post of posts) {
            if (!post.deleted_at && post.author_anon_id) {
                const netVotes = (post.upvotes || 0) - (post.downvotes || 0);
                userScores[post.author_anon_id] = (userScores[post.author_anon_id] || 0) + netVotes;
            }
        }

        // Process comments
        for (const comment of comments) {
            if (!comment.deleted_at && comment.author_anon_id) {
                const netVotes = (comment.upvotes || 0) - (comment.downvotes || 0);
                userScores[comment.author_anon_id] = (userScores[comment.author_anon_id] || 0) + netVotes;
            }
        }

        let topUser = null;
        let maxScore = -Infinity;

        for (const [anonId, score] of Object.entries(userScores)) {
            if (score > maxScore) {
                maxScore = score;
                topUser = anonId;
            }
        }

        if (!topUser) {
            return Response.json({ handle: null, score: 0 }, { status: 200 });
        }

        // Fetch real handle from topUser (anon_id)
        let handle = "#" + topUser.substring(0, 7); // fallback
        const userMatches = await base44.asServiceRole.entities.User.filter({ anon_id: topUser });
        if (userMatches && userMatches.length > 0) {
            const userMatch = userMatches[0];
            if (userMatch.handle) {
                handle = userMatch.handle;
            }
        }

        return Response.json({
            handle,
            score: maxScore
        }, { status: 200 });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Leaderboard error:", err);
        return Response.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}

export default withObservability(handler, "leaderboard");
