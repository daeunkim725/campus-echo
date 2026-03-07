import { requireVerified, checkRateLimit, handleCORS } from './_shared/authMiddleware.ts';
import { withObservability } from './_shared/observability.ts';

const handler = async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user } = await requireVerified(req);

        if (user.role !== "admin") {
            return Response.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (req.method !== "POST") {
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        }

        const body = await req.json();
        const { action, target_type, target_id, reported_by, report_id } = body;

        if (!action || !target_type || !target_id) {
            return Response.json({ error: "Invalid audit log parameters" }, { status: 400 });
        }

        // We emit this directly to the standardized logs instead of a database table
        // so it can be picked up by the external log viewer.
        const auditLog = {
            type: "AUDIT_LOG",
            timestamp: new Date().toISOString(),
            admin_email: user.email,
            action,
            target_type,
            target_id,
            reported_by: reported_by || null,
            report_id: report_id || null
        };

        console.info(JSON.stringify(auditLog));

        return Response.json({ success: true }, { status: 201 });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Audit log error:", err);
        return Response.json({ error: "Failed to create audit log" }, { status: 500 });
    }
}

export default withObservability(handler, "auditLogCreate");
