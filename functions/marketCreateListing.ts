import { requireVerified, checkRateLimit, handleCORS, getAnonId } from './_shared/authMiddleware.ts';

import { withObservability } from './_shared/observability.ts';

const ALLOWED_CATEGORIES = ["electronics", "furniture", "clothing", "books", "other"];
const ALLOWED_CONDITIONS = ["new", "like_new", "good", "fair", "poor"];

const handler = async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user, base44 } = await requireVerified(req);

        // Rate limit: 10 listings per hour
        const rateLimitResponse = checkRateLimit(req, "market_create", 10, 3600000);
        if (rateLimitResponse) return rateLimitResponse;

        if (req.method !== "POST") {
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        }

        const body = await req.json();
        const {
            title, description, price, is_free, category, condition, pickup_location_tag, images
        } = body;

        // Validations
        if (!title || typeof title !== "string" || title.trim().length < 3 || title.trim().length > 100) {
            return Response.json({ error: "Title must be between 3 and 100 characters" }, { status: 400 });
        }

        if (is_free !== true && (typeof price !== "number" || price < 0)) {
            return Response.json({ error: "Item must be marked as free or have a valid price >= 0" }, { status: 400 });
        }

        if (!ALLOWED_CATEGORIES.includes(category)) {
            return Response.json({ error: `Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}` }, { status: 400 });
        }

        if (!ALLOWED_CONDITIONS.includes(condition)) {
            return Response.json({ error: `Condition must be one of: ${ALLOWED_CONDITIONS.join(", ")}` }, { status: 400 });
        }

        let validImages: string[] = [];
        if (Array.isArray(images)) {
            validImages = images.filter(img => typeof img === "string" && img.startsWith("http")).slice(0, 10);
        }

        // Generate consistent anonymous ID
        const anonId = await getAnonId(user.email);

        const newListing = await base44.entities.Listing.create({
            school_id: user.school || "ETH",
            seller_email: user.email,         // Internal (never returned to clients)
            seller_anon_id: anonId,
            title: title.trim(),
            description: description ? String(description).trim() : "",
            price: is_free ? 0 : price,
            is_free: is_free === true,
            category,
            condition,
            pickup_location_tag: pickup_location_tag ? String(pickup_location_tag).trim().substring(0, 50) : "",
            status: "active",                 // active, reserved, sold
            images: validImages,              // Ordered array of image URLs
            reported_count: 0,
            created_at: Date.now(),
            updated_at: Date.now(),
            deleted_at: null
        });

        const safeListing = { ...newListing };
        delete safeListing.seller_email;

        return Response.json({ listing: safeListing }, { status: 201 });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Market create error:", err);
        return Response.json({ error: "Failed to create listing" }, { status: 500 });
    }
}

export default withObservability(handler, "marketCreateListing");
