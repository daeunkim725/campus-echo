import { db } from "@/lib/db";
import { requireVerified, getAnonId } from "@/lib/auth";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";

const ALLOWED_CATEGORIES = ["electronics", "furniture", "clothing", "books", "other"];
const ALLOWED_CONDITIONS = ["new", "like_new", "good", "fair", "poor"];

// ─── GET /api/market/listings ──────────────────────────────────────────────

export async function GET(request: Request) {
    try {
        const { user } = await requireVerified(request);
        const url = new URL(request.url);
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
        const limit = Math.min(50, parseInt(url.searchParams.get("limit") ?? "20", 10));
        const category = url.searchParams.get("category") ?? undefined;
        const condition = url.searchParams.get("condition") ?? undefined;
        const status = url.searchParams.get("status") ?? "active";

        const where: Record<string, unknown> = {
            school_id: user.school_id ?? "ETHZ",
            deleted_at: null,
            status,
        };
        if (category && category !== "all") where.category = category;
        if (condition && condition !== "all") where.condition = condition;

        const skip = (page - 1) * limit;
        const [listings, total] = await Promise.all([
            db.listing.findMany({
                where,
                orderBy: { created_at: "desc" },
                skip,
                take: limit,
                include: { images: { orderBy: { order_index: "asc" } } },
            }),
            db.listing.count({ where }),
        ]);

        const myAnonId = await getAnonId(user.email);
        const sanitized = listings.map((l) => ({
            ...l,
            is_own_listing: l.seller_anon_id === myAnonId,
        }));

        return Response.json({ listings: sanitized, has_more: skip + limit < total });
    } catch (err) {
        if (err instanceof Response) return err;
        return Response.json({ error: "Failed to fetch listings" }, { status: 500 });
    }
}

// ─── POST /api/market/listings ─────────────────────────────────────────────

export async function POST(request: Request) {
    try {
        const { user } = await requireVerified(request);
        const ip = request.headers.get("x-forwarded-for") ?? "unknown";
        const limited = checkRateLimit(rateLimitKey("market_create", ip), 10, 3600000);
        if (limited) return limited;

        const body = await request.json();
        const { title, description, price, is_free, category, condition, pickup_location_tag, images } = body;

        if (!title || title.trim().length < 3 || title.trim().length > 100) {
            return Response.json({ error: "Title must be 3–100 characters" }, { status: 400 });
        }
        if (is_free !== true && (typeof price !== "number" || price < 0)) {
            return Response.json({ error: "Item must be free or have a valid price ≥ 0" }, { status: 400 });
        }
        if (!ALLOWED_CATEGORIES.includes(category)) {
            return Response.json({ error: `Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}` }, { status: 400 });
        }
        if (!ALLOWED_CONDITIONS.includes(condition)) {
            return Response.json({ error: `Condition must be one of: ${ALLOWED_CONDITIONS.join(", ")}` }, { status: 400 });
        }

        const validImages: string[] = Array.isArray(images)
            ? images.filter((i: unknown) => typeof i === "string" && i.startsWith("http")).slice(0, 10)
            : [];

        const anonId = await getAnonId(user.email);

        // Ensure school row exists
        await db.school.upsert({
            where: { id: user.school_id ?? "ETHZ" },
            create: { id: user.school_id ?? "ETHZ", name: user.school_id ?? "ETHZ", domains: [] },
            update: {},
        });

        const listing = await db.listing.create({
            data: {
                school_id: user.school_id ?? "ETHZ",
                seller_id: user.id,
                seller_anon_id: anonId,
                title: title.trim(),
                description: description ? String(description).trim() : "",
                price: is_free ? 0 : price,
                is_free: is_free === true,
                category,
                condition,
                pickup_location_tag: pickup_location_tag ? String(pickup_location_tag).trim().substring(0, 50) : null,
                images: {
                    create: validImages.map((url, i) => ({ url, order_index: i })),
                },
            },
            include: { images: { orderBy: { order_index: "asc" } } },
        });

        return Response.json({ listing }, { status: 201 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Market create error:", err);
        return Response.json({ error: "Failed to create listing" }, { status: 500 });
    }
}
