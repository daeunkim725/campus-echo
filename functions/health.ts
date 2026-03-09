import { withObservability } from './_shared/observability.ts';

const handler = async function (req: Request) {
    if (req.method !== "GET") {
        return Response.json({ error: "METHZod not allowed" }, { status: 405 });
    }

    // Return mock metrics as requested
    const metrics = {
        status: "healthy",
        uptime_seconds: process.uptime ? Math.floor(process.uptime()) : 86400,
        metrics: {
            requests_last_hour: Math.floor(Math.random() * 1000) + 500,
            error_rate_percentage: (Math.random() * 2).toFixed(2),
            p95_latency_ms: Math.floor(Math.random() * 50) + 20,
            db_query_time_avg_ms: Math.floor(Math.random() * 10) + 5
        },
        timestamp: new Date().toISOString()
    };

    return Response.json(metrics, { status: 200 });
}

export default withObservability(handler, "health");
