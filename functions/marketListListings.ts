import { requireVerified, handleCORS, getAnonId } from './_shared/authMiddleware.ts';

import { withObservability } from './_shared/observability.ts';

const handler = async function (req: Request) {
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    try {
        const { user, base44 } = await requireVerified(req);

        if (req.method !== "GET") {
            return Response.json({ error: "METHZod not allowed" }, { status: 405 });
        }

        const url = new URL(req.url);
        const category = url.searchParams.get("category");
        const isFree = url.searchParams.get("is_free") === "true";
        const includeSold = url.searchParams.get("include_sold") === "true";
        const sort = url.searchParams.get("sort") || "newest"; // newest, price_asc, price_desc
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "20", 10);

        const userSchool = user.school || "ETHZ";

        // Fetch bare minimum filter using SDK, then refine locally
        let filters: any = { school_id: userSchool };
        if (category) filters.category = category;
        if (isFree) filters.is_free = true;

        let allListings = await base44.asServiceRole.entities.Listing.filter(filters);

        // Filter out deleted and resolve "include_sold"
        allListings = allListings.filter((l: any) => {
            if (l.deleted_at) return false;
            // By default, exclude sold and reserved
            if (!includeSold && (l.status === "sold" || l.status === "reserved")) {
                return false;
            }
            return true;
        });

        // Apply Sorting
        if (sort === "newest") {
            allListings.sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0));
        } else if (sort === "price_asc") {
            allListings.sort((a: any, b: any) => {
                const priceA = a.is_free ? 0 : (a.price || 0);
                const priceB = b.is_free ? 0 : (b.price || 0);
                // Secondary sort by date if prices match
                if (priceA === priceB) return (b.created_at || 0) - (a.created_at || 0);
                return priceA - priceB;
            });
        } else if (sort === "price_desc") {
            allListings.sort((a: any, b: any) => {
                const priceA = a.is_free ? 0 : (a.price || 0);
                const priceB = b.is_free ? 0 : (b.price || 0);
                if (priceA === priceB) return (b.created_at || 0) - (a.created_at || 0);
                return priceB - priceA;
            });
        }

        // Paginate
        const startIndex = (page - 1) * limit;
        const paginatedListings = allListings.slice(startIndex, startIndex + limit);

        // Fetch user's persistent anon ID to flag their own listings
        const myAnonId = await getAnonId(user.email);

        // Sanitize
        const sanitizedListings = paginatedListings.map((l: any) => {
            const isOwn = (l.seller_email === user.email) || (l.seller_anon_id === myAnonId);
            const safeListing = {
                ...l,
                is_own_listing: isOwn
            };
            delete safeListing.seller_email;
            return safeListing;
        });

        return Response.json({
            listings: sanitizedListings,
            has_more: startIndex + limit < allListings.length
        }, { status: 200 });

    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Market list error:", err);
        return Response.json({ error: "Failed to fetch listings" }, { status: 500 });
    }
}

export default withObservability(handler, "marketListListings");
