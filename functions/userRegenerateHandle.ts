import { requireVerified, handleCORS, checkRateLimit, generateHandle, corsHeaders } from './_shared/authMiddleware.ts';
import { withObservability } from './_shared/observability.ts';

const handler = async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    if (req.method !== "POST") {
        return Response.json({ error: "METHZod not allowed" }, { status: 405, headers: corsHeaders() });
    }

    try {
        const { user, base44 } = await requireVerified(req);

        // Rate limit: 1 handle regenerate per 24 hours
        const rateLimitResponse = checkRateLimit(req, `handle_regenerate_${user.id}`, 1, 24 * 60 * 60 * 1000);
        if (rateLimitResponse) return rateLimitResponse;

        // Generate a new unique handle
        let newHandle = "";
        let isUnique = false;
        while (!isUnique) {
            newHandle = generateHandle();
            const existingWithHandle = await base44.asServiceRole.entities.User.filter({ handle: newHandle });
            if (!existingWithHandle || existingWithHandle.length === 0) {
                isUnique = true;
            }
        }

        await base44.asServiceRole.entities.User.update(user.id, { handle: newHandle });

        console.log(`[userRegenerateHandle] User ${user.email} regenerated handle: ${user.handle} -> ${newHandle}`);

        return Response.json({ handle: newHandle }, { status: 200, headers: corsHeaders() });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Handle regenerate error:", err);
        return Response.json({ error: "Failed to regenerate handle" }, { status: 500, headers: corsHeaders() });
    }
}

export default withObservability(handler, "userRegenerateHandle");
