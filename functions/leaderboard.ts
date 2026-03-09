import { requireVerified, handleCORS, corsHeaders } from './_shared/authMiddleware.ts';
import { withObservability } from './_shared/observability.ts';

const handler = async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user: currentUser, base44 } = await requireVerified(req);

        if (req.method !== "GET" && req.method !== "POST") {
            return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders() });
        }

        // Parse query params or body
        let school_id = currentUser.school_id || currentUser.school;
        let time_window = "all-time";

        if (req.method === "POST") {
            try {
                const body = await req.json();
                if (body.school_id) school_id = body.school_id;
                if (body.time_window) time_window = body.time_window;
            } catch (e) {
                // ignore
            }
        } else {
            const url = new URL(req.url);
            const s = url.searchParams.get("school_id");
            const t = url.searchParams.get("time_window");
            if (s) school_id = s;
            if (t) time_window = t;
        }

        // Fetch data concurrently
        // Note: Base44 filter might have limits, but for a POC we'll grab everything for the school
        const [posts, comments, listings, allUsers] = await Promise.all([
            base44.asServiceRole.entities.Post.filter({ school: school_id }),
            base44.asServiceRole.entities.Comment.filter({ school: school_id }),
            base44.asServiceRole.entities.MarketListing.filter({ school: school_id }),
            base44.asServiceRole.entities.User.filter({ school: school_id })
        ]);

        const timeLimit = time_window === "today"
            ? Date.now() - 24 * 60 * 60 * 1000
            : time_window === "week"
                ? Date.now() - 7 * 24 * 60 * 60 * 1000
                : 0;

        const userStats: Record<string, any> = {};

        // Initialize userStats for all users in the school
        for (const u of allUsers) {
            userStats[u.anon_id || u.email] = {
                id: u.id,
                email: u.email,
                handle: u.handle || "Anonymous",
                points: 0,
                posts_count: 0,
                comments_count: 0,
                listings_count: 0,
                anon_id: u.anon_id
            };
        }

        // Helper to check time
        const isInTime = (dateStr: string) => {
            if (!timeLimit) return true;
            if (!dateStr) return false;
            return new Date(dateStr).getTime() >= timeLimit;
        };

        // Process posts
        for (const p of posts) {
            const authorKey = p.author_anon_id || p.author_id || p.created_by;
            if (!authorKey || !userStats[authorKey]) continue;

            if (isInTime(p.created_date || p.created_at)) {
                userStats[authorKey].posts_count++;
                const netVotes = (p.upvotes || 0) - (p.downvotes || 0);
                userStats[authorKey].points += netVotes;
            }
        }

        // Process comments
        for (const c of comments) {
            const authorKey = c.author_anon_id || c.author_id || c.created_by;
            if (!authorKey || !userStats[authorKey]) continue;

            if (isInTime(c.created_date || c.created_at)) {
                userStats[authorKey].comments_count++;
                const netVotes = (c.upvotes || 0) - (c.downvotes || 0);
                userStats[authorKey].points += netVotes;
            }
        }

        // Process listings
        for (const l of listings) {
            const authorKey = l.created_by; // Listings usually have created_by as email
            // Find user entry by email if needed
            let entry = userStats[authorKey];
            if (!entry) {
                // Try finding by anon_id if authorKey is email
                const userObj = allUsers.find((u: any) => u.email === authorKey);
                if (userObj) entry = userStats[userObj.anon_id || userObj.email];
            }

            if (entry && isInTime(l.created_at || l.created_date)) {
                entry.listings_count++;
            }
        }

        // Convert to array and sort
        const leaderboard = Object.values(userStats)
            .sort((a: any, b: any) => b.points - a.points || b.posts_count - a.posts_count);

        // Add ranks
        const rankedList = leaderboard.map((item, index) => ({
            ...item,
            rank: index + 1
        }));

        // Find current user's entry
        const myKey = currentUser.anon_id || currentUser.email;
        const myEntry = rankedList.find(r => r.anon_id === myKey || r.email === myKey);

        return Response.json({
            leaderboard: rankedList.slice(0, 50), // Top 50
            myRank: myEntry || null,
            school_id,
            time_window
        }, { status: 200, headers: corsHeaders() });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Leaderboard error:", err);
        return Response.json({ error: "Failed to fetch leaderboard" }, { status: 500, headers: corsHeaders() });
    }
}

export default withObservability(handler, "leaderboard");
