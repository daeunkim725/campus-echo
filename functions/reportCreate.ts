import { requireVerified, checkRateLimit, handleCORS } from './_shared/authMiddleware.ts';

import { withObservability } from './_shared/observability.ts';

const handler = async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user, base44 } = await requireVerified(req);

        // Rate limit: 10 reports per hour
        const rateLimitResponse = checkRateLimit(req, "report_create", 10, 3600000);
        if (rateLimitResponse) return rateLimitResponse;

        if (req.method !== "POST") {
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        }

        const body = await req.json();
        const { target_type, target_id, reason } = body;

        if (!["post", "comment"].includes(target_type) || !target_id || !reason) {
            return Response.json({ error: "Invalid report parameters" }, { status: 400 });
        }

        // Fetch target
        const TargetEntity = target_type === "post" ? base44.asServiceRole.entities.Post : base44.asServiceRole.entities.Comment;
        const targets = await TargetEntity.filter({ id: target_id });
        const target = targets[0];

        if (!target) {
            return Response.json({ error: "Target not found" }, { status: 404 });
        }

        // Check if user already reported this
        const existingReports = await base44.asServiceRole.entities.Report.filter({
            reporter_email: user.email,
            target_id: target_id,
            target_type: target_type
        });

        if (existingReports.length > 0) {
            return Response.json({ error: "You have already reported this item" }, { status: 400 });
        }

        // Create report
        await base44.asServiceRole.entities.Report.create({
            reporter_email: user.email,
            target_type,
            target_id,
            reason: String(reason).substring(0, 500),
            created_at: Date.now()
        });

        // Increment report count on target
        await TargetEntity.update(target_id, {
            reported_count: (target.reported_count || 0) + 1
        });

        return Response.json({ success: true }, { status: 201 });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Report create error:", err);
        return Response.json({ error: "Failed to submit report" }, { status: 500 });
    }
}

export default withObservability(handler, "reportCreate");
