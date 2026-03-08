import { requireVerified, checkRateLimit, handleCORS } from './_shared/authMiddleware.ts';

export default async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user, base44 } = await requireVerified(req);

        // Ensure only admins can access this
        if (user.role !== "admin") {
            return Response.json({ error: "Unauthorized" }, { status: 403 });
        }

        const rateLimitResponse = checkRateLimit(req, "systemStats", 100, 3600000);
        if (rateLimitResponse) return rateLimitResponse;

        if (req.method !== "POST") {
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        }

        // Mock data for observability dashboard as per prompt "displays the existing system cards"
        const stats = {
            p95_latency: "45ms",
            requests_last_24h: 12500,
            error_rate: "0.2%",
            database_events: 5300
        };

        return Response.json(stats, { status: 200 });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("System stats error:", err);
        return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
