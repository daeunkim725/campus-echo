import { db } from "@/lib/db";
import { requireVerified, getAnonId, calculateHotScore } from "@/lib/auth";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";

// ─── GET /api/feed ─────────────────────────────────────────────────────────

export async function GET(request: Request) {
    try {
        const { user } = await requireVerified(request);
        const url = new URL(request.url);
        const sort = url.searchParams.get("sort") ?? "new"; // "new" | "hot" | "top"
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const limit = Math.min(50, parseInt(url.searchParams.get("limit") ?? "20", 10));
        const category = url.searchParams.get("category") ?? undefined;

        const schoolId = user.school_id ?? "ETHZ";
        const skip = (page - 1) * limit;

        const whereClause: Record<string, unknown> = {
            school_id: schoolId,
            deleted_at: null,
        };
        if (category && category !== "all") whereClause.category = category;

        const orderBy =
            sort === "top"
                ? [{ upvotes: "desc" as const }]
                : sort === "hot"
                    ? [{ score: "desc" as const }]
                    : [{ created_at: "desc" as const }];

        const [posts, total] = await Promise.all([
            db.post.findMany({
                where: whereClause,
                orderBy,
                skip,
                take: limit,
                include: { pollOptions: true },
            }),
            db.post.count({ where: whereClause }),
        ]);

        // Fetch user's votes on these posts
        const postIds = posts.map((p) => p.id);
        const myVotes = await db.vote.findMany({
            where: { user_id: user.id, target_type: "post", target_id: { in: postIds } },
        });
        const voteMap: Record<string, number> = {};
        for (const v of myVotes) voteMap[v.target_id] = v.vote_value;

        const myAnonId = await getAnonId(user.email);

        // Fetch parent posts for reposts/quotes
        const parentIds = posts.flatMap((p) => (p.parent_post_id ? [p.parent_post_id] : []));
        const parentPosts =
            parentIds.length > 0
                ? await db.post.findMany({ where: { id: { in: parentIds } } })
                : [];
        const parentMap: Record<string, typeof parentPosts[0] | null> = {};
        for (const p of parentPosts) parentMap[p.id] = p;

        const sanitized = posts.map((p) => ({
            ...p,
            is_own_post: p.author_anon_id === myAnonId,
            user_vote: voteMap[p.id] ?? 0,
            parent_post: p.parent_post_id ? (parentMap[p.parent_post_id] ?? null) : null,
        }));

        return Response.json({ posts: sanitized, has_more: skip + limit < total });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Feed list error:", err);
        return Response.json({ error: "Failed to fetch feed" }, { status: 500 });
    }
}

// ─── POST /api/feed ────────────────────────────────────────────────────────

export async function POST(request: Request) {
    try {
        const { user } = await requireVerified(request);
        const ip = request.headers.get("x-forwarded-for") ?? "unknown";
        const limited = checkRateLimit(rateLimitKey("feed_create", ip), 5, 3600000);
        if (limited) return limited;

        const body = await request.json();
        const { content, category, post_type, poll_options, parent_post_id, gif_url } = body;

        const validTypes = ["text", "poll", "repost", "quote"];
        const type = validTypes.includes(post_type) ? post_type : "text";

        if (type !== "repost" && type !== "quote" && (!content || content.trim().length === 0)) {
            return Response.json({ error: "Content is required" }, { status: 400 });
        }

        // Validate poll options
        if (type === "poll") {
            if (!Array.isArray(poll_options) || poll_options.length < 2) {
                return Response.json({ error: "Polls require at least two options" }, { status: 400 });
            }
        }

        // Validate repost/quote parent
        let rootPostId: string | null = null;
        if ((type === "repost" || type === "quote") && parent_post_id) {
            const parent = await db.post.findFirst({ where: { id: parent_post_id, deleted_at: null } });
            if (!parent) {
                return Response.json({ error: "Parent post not found or deleted" }, { status: 404 });
            }
            rootPostId = parent.root_post_id ?? parent.id;
            await db.post.update({
                where: { id: rootPostId },
                data: {
                    repost_count: type === "repost" ? { increment: 1 } : undefined,
                    quote_count: type === "quote" ? { increment: 1 } : undefined,
                },
            });
        }

        const anonId = await getAnonId(user.email);

        const post = await db.post.create({
            data: {
                school_id: user.school_id ?? "ETHZ",
                author_id: user.id,
                author_anon_id: anonId,
                author_mood: user.mood ?? "chill",
                content: content ? content.trim() : "",
                category: category ?? "general",
                post_type: type,
                parent_post_id: parent_post_id ?? null,
                root_post_id: rootPostId,
                gif_url: gif_url ?? null,
                pollOptions:
                    type === "poll"
                        ? {
                            create: poll_options
                                .slice(0, 4)
                                .map((text: string, i: number) => ({
                                    text: String(text).substring(0, 50).trim(),
                                    order_index: i,
                                })),
                        }
                        : undefined,
            },
            include: { pollOptions: true },
        });

        return Response.json({ post }, { status: 201 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Feed create error:", err);
        return Response.json({ error: "Failed to create post" }, { status: 500 });
    }
}
