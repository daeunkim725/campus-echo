import { requireVerified, checkRateLimit, handleCORS } from './_shared/authMiddleware.ts';

import { withObservability } from './_shared/observability.ts';

const ALLOWED_CATEGORIES = ["electronics", "furniture", "clothing", "books", "other"];
const ALLOWED_CONDITIONS = ["new", "like_new", "good", "fair", "poor"];
const ALLOWED_STATUSES = ["active", "reserved", "sold"];

const handler = async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user, base44 } = await requireVerified(req);

        // Rate limit: 30 updates per hour
        const rateLimitResponse = checkRateLimit(req, "market_update", 30, 3600000);
        if (rateLimitResponse) return rateLimitResponse;

        if (req.method !== "PUT") {
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        }

        const body = await req.json();
        const { id, title, description, price, is_free, category, condition, pickup_location_tag, images, status } = body;

        if (!id) {
            return Response.json({ error: "Listing ID is required" }, { status: 400 });
        }

        const listings = await base44.asServiceRole.entities.Listing.filter({ id });
        const listing = listings[0];

        if (!listing || listing.deleted_at) {
            return Response.json({ error: "Listing not found" }, { status: 404 });
        }

        // Verify ownership
        if (listing.seller_email !== user.email && user.role !== "admin") {
            return Response.json({ error: "Unauthorized to update this listing" }, { status: 403 });
        }

        const updateData: any = { updated_at: Date.now() };

        // Process allowed fields
        if (title !== undefined) {
            if (typeof title !== "string" || title.trim().length < 3 || title.trim().length > 100) {
                return Response.json({ error: "Title must be between 3 and 100 characters" }, { status: 400 });
            }
            updateData.title = title.trim();
        }

        if (description !== undefined) {
            updateData.description = String(description).trim();
        }

        // Only enforce price rules if either price or is_free is being updated
        if (price !== undefined || is_free !== undefined) {
            const newIsFree = is_free !== undefined ? is_free : listing.is_free;
            const newPrice = price !== undefined ? price : listing.price;

            if (newIsFree !== true && (typeof newPrice !== "number" || newPrice < 0)) {
                return Response.json({ error: "Item must be marked as free or have a valid price >= 0" }, { status: 400 });
            }
            updateData.is_free = newIsFree;
            updateData.price = newIsFree ? 0 : newPrice;
        }

        if (category !== undefined) {
            if (!ALLOWED_CATEGORIES.includes(category)) {
                return Response.json({ error: `Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}` }, { status: 400 });
            }
            updateData.category = category;
        }

        if (condition !== undefined) {
            if (!ALLOWED_CONDITIONS.includes(condition)) {
                return Response.json({ error: `Condition must be one of: ${ALLOWED_CONDITIONS.join(", ")}` }, { status: 400 });
            }
            updateData.condition = condition;
        }

        if (pickup_location_tag !== undefined) {
            updateData.pickup_location_tag = String(pickup_location_tag).trim().substring(0, 50);
        }

        if (status !== undefined) {
            if (!ALLOWED_STATUSES.includes(status)) {
                return Response.json({ error: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}` }, { status: 400 });
            }
            updateData.status = status;
        }

        if (images !== undefined) {
            if (Array.isArray(images)) {
                updateData.images = images.filter(img => typeof img === "string" && img.startsWith("http")).slice(0, 10);
            } else {
                updateData.images = [];
            }
        }

        await base44.asServiceRole.entities.Listing.update(id, updateData);

        // Fetch the fresh updated version to return
        const updatedListing = (await base44.asServiceRole.entities.Listing.filter({ id }))[0];

        const safeListing = { ...updatedListing };
        delete safeListing.seller_email;

        return Response.json({ listing: safeListing }, { status: 200 });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Market update error:", err);
        return Response.json({ error: "Failed to update listing" }, { status: 500 });
    }
}

export default withObservability(handler, "marketUpdateListing");
