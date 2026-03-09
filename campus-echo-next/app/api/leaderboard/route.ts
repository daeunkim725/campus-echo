import { db } from "@/lib/db";
import { requireVerified, getAnonId } from "@/lib/auth";

// GET /api/leaderboard?school_id=ETHZ&time_window=all-time|today|week
export async function GET(request: Request) {
    try {
        const { user } = await requireVerified(request);
        const url = new URL(request.url);
        const schoolId = url.searchParams.get("school_id") ?? user.school_id ?? "ETHZ";
        const timeWindow = url.searchParams.get("time_window") ?? "all-time";

        let since: Date | undefined;
        if (timeWindow === "today") since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        else if (timeWindow === "week") since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const createdAtFilter = since ? { gte: since } : undefined;

        // Fetch all data for the school concurrently
        const [posts, comments, listings, users] = await Promise.all([
            db.post.findMany({
                where: { school_id: schoolId, deleted_at: null, ...(createdAtFilter ? { created_at: createdAtFilter } : {}) },
                select: { author_anon_id: true, upvotes: true, downvotes: true },
            }),
            db.comment.findMany({
                where: { post: { school_id: schoolId }, deleted_at: null, ...(createdAtFilter ? { created_at: createdAtFilter } : {}) },
                select: { author_anon_id: true, upvotes: true, downvotes: true },
            }),
            db.listing.findMany({
                where: { school_id: schoolId, deleted_at: null, ...(createdAtFilter ? { created_at: createdAtFilter } : {}) },
                select: { seller_anon_id: true },
            }),
            db.user.findMany({
                where: { school_id: schoolId },
                select: { id: true, handle: true, anon_id: true, mood: true },
            }),
        ]);

        // Aggregate by anon_id
        const stats: Record<string, {
            anon_id: string; handle: string; mood: string | null;
            points: number; posts_count: number; comments_count: number; listings_count: number;
        }> = {};

        for (const u of users) {
            if (!u.anon_id) continue;
            stats[u.anon_id] = { anon_id: u.anon_id, handle: u.handle, mood: u.mood, points: 0, posts_count: 0, comments_count: 0, listings_count: 0 };
        }

        for (const p of posts) {
            const s = stats[p.author_anon_id];
            if (!s) continue;
            s.posts_count++;
            s.points += (p.upvotes ?? 0) - (p.downvotes ?? 0);
        }
        for (const c of comments) {
            const s = stats[c.author_anon_id];
            if (!s) continue;
            s.comments_count++;
            s.points += (c.upvotes ?? 0) - (c.downvotes ?? 0);
        }
        for (const l of listings) {
            const s = stats[l.seller_anon_id];
            if (s) s.listings_count++;
        }

        const ranked = Object.values(stats)
            .sort((a, b) => b.points - a.points || b.posts_count - a.posts_count)
            .slice(0, 50)
            .map((item, i) => ({ ...item, rank: i + 1 }));

        const myAnonId = await getAnonId(user.email);
        const myEntry = ranked.find((r) => r.anon_id === myAnonId) ?? null;

        return Response.json({ leaderboard: ranked, myRank: myEntry, school_id: schoolId, time_window: timeWindow });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Leaderboard error:", err);
        return Response.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
