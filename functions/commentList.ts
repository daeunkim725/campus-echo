import { requireVerified, handleCORS, getAnonId } from './_shared/authMiddleware.ts';

export default async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user, base44 } = await requireVerified(req);

        if (req.method !== "GET") {
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        }

        const url = new URL(req.url);
        const postId = url.searchParams.get("post_id");

        if (!postId) {
            return Response.json({ error: "Post ID is required" }, { status: 400 });
        }

        // Fetch all comments for the post
        let allComments = await base44.asServiceRole.entities.Comment.filter({
            post_id: postId
        });

        // Filter out deleted
        allComments = allComments.filter((c: any) => !c.deleted_at);

        // Sort chronologically (oldest first for comments usually)
        allComments.sort((a: any, b: any) => (a.created_at || 0) - (b.created_at || 0));

        // Fetch current user's votes for these comments
        const commentIds = allComments.map((c: any) => c.id);
        const userVotes = await base44.asServiceRole.entities.Vote.filter({
            user_email: user.email,
            target_type: "comment"
        });

        const voteMap: Record<string, number> = {};
        const commentIdSet = new Set(commentIds);
        for (const v of userVotes) {
            if (commentIdSet.has((v as any).target_id)) {
                voteMap[(v as any).target_id] = (v as any).vote_value;
            }
        }

        // Fetch user's persistent anon ID
        const myAnonId = await getAnonId(user.email);

        // Sanitize and format
        const sanitizedComments = allComments.map((c: any) => {
            const isOwn = (c.author_email === user.email) || (c.author_anon_id === myAnonId);
            const safeComment = {
                ...c,
                is_own_comment: isOwn,
                user_vote: voteMap[c.id] || 0
            };
            delete safeComment.author_email;
            return safeComment;
        });

        return Response.json({ comments: sanitizedComments }, { status: 200 });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Comment list error:", err);
        return Response.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}
