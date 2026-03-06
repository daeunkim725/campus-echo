import { requireVerified, handleCORS } from './_shared/authMiddleware.ts';

export default async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user, base44 } = await requireVerified(req);

        if (req.method !== "DELETE") {
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        }

        const url = new URL(req.url);
        const listingId = url.searchParams.get("id");

        if (!listingId) {
            return Response.json({ error: "Listing ID is required" }, { status: 400 });
        }

        const listings = await base44.asServiceRole.entities.Listing.filter({ id: listingId });
        const listing = listings[0];

        if (!listing) {
            return Response.json({ error: "Listing not found" }, { status: 404 });
        }

        // Verify ownership
        if (listing.seller_email !== user.email && user.role !== "admin") {
            return Response.json({ error: "Unauthorized to delete this listing" }, { status: 403 });
        }

        // Soft delete
        await base44.asServiceRole.entities.Listing.update(listingId, {
            deleted_at: Date.now(),
            status: "deleted" // Just to be extra safe with existing queries
        });

        return Response.json({ success: true }, { status: 200 });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Market delete error:", err);
        return Response.json({ error: "Failed to delete listing" }, { status: 500 });
    }
}
