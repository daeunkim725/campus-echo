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
        const sort = url.searchParams.get("sort") || "new"; // new, hot, top
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "20", 10);
        // Fallback to ETH if user has no school somehow
        const userSchool = user.school || "ETH";

        // Fetch all posts for the school. 
        // We use asServiceRole to bypass base RLS rules, we filter Manually
        let allPosts = await base44.asServiceRole.entities.Post.filter({
            school_id: userSchool
        });

        // Filter out deleted posts
        allPosts = allPosts.filter((p: any) => !p.deleted_at);

        // Sort posts
        if (sort === "new") {
            allPosts.sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0));
        } else if (sort === "top") {
            allPosts.sort((a: any, b: any) => {
                const bNet = (b.upvotes || 0) - (b.downvotes || 0);
                const aNet = (a.upvotes || 0) - (a.downvotes || 0);
                return bNet - aNet;
            });
        } else if (sort === "hot") {
            allPosts.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
        }

        // Paginate
        const startIndex = (page - 1) * limit;
        const paginatedPosts = allPosts.slice(startIndex, startIndex + limit);

        // Gather all parent and root post IDs that need to be fetched for previews
        const parentIdsToFetch = new Set<string>();
        for (const p of paginatedPosts) {
            if ((p.post_type === "repost" || p.post_type === "quote") && p.parent_post_id) {
                parentIdsToFetch.add(p.parent_post_id);
            }
        }

        // Fetch parent posts
        const parentPostsMap: Record<string, any> = {};
        if (parentIdsToFetch.size > 0) {
            const parentPosts = await Promise.all(
                Array.from(parentIdsToFetch).map(id => base44.asServiceRole.entities.Post.get(id).catch(() => null))
            );
            for (const p of parentPosts) {
                if (p) {
                    parentPostsMap[p.id] = { ...p };
                    delete parentPostsMap[p.id].author_email;
                }
            }
        }

        // Fetch current user's votes for these posts
        const postIds = paginatedPosts.map((p: any) => p.id);
        const userVotes = await base44.asServiceRole.entities.Vote.filter({
            user_email: user.email,
            target_type: "post"
        });

        const voteMap: Record<string, number> = {};
        for (const v of userVotes) {
            if (postIds.includes((v as any).target_id)) {
                voteMap[(v as any).target_id] = (v as any).vote_value;
            }
        }

        // Fetch user's persistent anon ID to flag their own posts
        const myAnonId = await getAnonId(user.email);

        // Sanitize and format the response
        const sanitizedPosts = paginatedPosts.map((p: any) => {
            const isOwn = (p.author_email === user.email) || (p.author_anon_id === myAnonId);

            let parentData = null;
            if (p.parent_post_id) {
                 parentData = parentPostsMap[p.parent_post_id] || { id: p.parent_post_id, deleted_at: Date.now() }; // stub if deleted
            }

            const safePost = {
                ...p,
                is_own_post: isOwn,
                user_vote: voteMap[p.id] || 0, // 1 for up, -1 for down, 0 for none
                parent_post: parentData
            };
            // NEVER reveal real identity to the client
            delete safePost.author_email;
            return safePost;
        });

        return Response.json({
            posts: sanitizedPosts,
            has_more: startIndex + limit < allPosts.length
        });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Feed list error:", err);
        return Response.json({ error: "Failed to fetch feed" }, { status: 500 });
    }
}
