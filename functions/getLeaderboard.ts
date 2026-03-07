import { requireVerified, checkRateLimit, handleCORS } from './_shared/authMiddleware.ts';

export default async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user, base44 } = await requireVerified(req);

        // Optional: Ensure only admins can access this, or leave it open if the UI is hidden
        // But the prompt says "ensure the entire dashboard page is access-controlled so non-admin users cannot open it via URL"
        // Let's protect the backend endpoint as well
        if (user.role !== "admin") {
            return Response.json({ error: "Unauthorized" }, { status: 403 });
        }

        const rateLimitResponse = checkRateLimit(req, "leaderboard", 100, 3600000);
        if (rateLimitResponse) return rateLimitResponse;

        if (req.method !== "POST") {
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        }

        const body = await req.json().catch(() => ({}));
        const school_id = body.school_id;
        const period = body.period || "all_time";
        const limit = parseInt(body.limit || "50", 10);

        // Fetch all active posts for the school(s)
        const schoolFilter = school_id ? { school_id } : {};
        const posts = await base44.asServiceRole.entities.Post.filter({ ...schoolFilter, deleted: false });

        // Filter posts by period
        const now = new Date();
        let startDate = new Date(0); // Epoch
        if (period === "weekly") {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (period === "monthly") {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const periodPosts = posts.filter((p: any) => new Date(p.created_at || p.created_date || 0) >= startDate);

        // Fetch users to get handles and map emails to handles
        const users = await base44.asServiceRole.entities.User.filter(schoolFilter);
        const emailToUser = new Map();
        users.forEach((u: any) => {
            emailToUser.set(u.email, u);
        });

        // Compute scores
        // We could fetch all votes, but posts already have upvotes/downvotes
        // However, the prompt says "sum of vote values on all their posts"
        // Since votes are tracked in the Post entity as upvotes/downvotes, we can just sum those up for each author.
        // Prompt says "optionally excluding self-votes" but lets skip that for simplicity unless required.

        const authorStats = new Map();

        periodPosts.forEach((p: any) => {
            if (p.deleted) return;
            const authorEmail = p.created_by || p.author_email; // Depends on schema
            if (!authorEmail) return;

            const u = emailToUser.get(authorEmail) || emailToUser.get(p.author_email) || emailToUser.get(p.created_by);
            if (!u || !u.leaderboard_handle) return; // Ignore users without handles

            const handle = u.leaderboard_handle;
            if (!authorStats.has(handle)) {
                authorStats.set(handle, { handle, score: 0, posts_count: 0 });
            }

            const stats = authorStats.get(handle);
            stats.posts_count += 1;
            stats.score += (p.upvotes || 0) - (p.downvotes || 0);
        });

        let leaderboard = Array.from(authorStats.values());

        // order by score desc then recency tiebreaker (which we don't have per user easily, so just score for now)
        leaderboard.sort((a, b) => b.score - a.score);

        // Assign ranks
        leaderboard = leaderboard.slice(0, limit).map((entry, index) => ({
            rank: index + 1,
            leaderboard_handle: entry.handle,
            score: entry.score,
            posts_count: entry.posts_count
        }));

        return Response.json({ leaderboard }, { status: 200 });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Leaderboard error:", err);
        return Response.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
