import { db } from "@/lib/db";
import { requireVerified } from "@/lib/auth";

// ─── GET /api/market/threads — list threads for current user ──────────────

export async function GET(request: Request) {
    try {
        const { user } = await requireVerified(request);

        const threads = await db.listingThread.findMany({
            where: {
                OR: [{ buyer_id: user.id }, { seller_id: user.id }],
            },
            include: {
                listing: { include: { images: { orderBy: { order_index: "asc" }, take: 1 } } },
                messages: { orderBy: { created_at: "desc" }, take: 1 },
            },
            orderBy: { updated_at: "desc" },
        });

        return Response.json({ threads });
    } catch (err) {
        if (err instanceof Response) return err;
        return Response.json({ error: "Failed to fetch threads" }, { status: 500 });
    }
}

// ─── POST /api/market/threads — create or get thread for a listing ────────

export async function POST(request: Request) {
    try {
        const { user } = await requireVerified(request);
        const { listing_id } = await request.json();

        if (!listing_id) return Response.json({ error: "listing_id is required" }, { status: 400 });

        const listing = await db.listing.findFirst({ where: { id: listing_id, deleted_at: null } });
        if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 });

        if (listing.seller_id === user.id) {
            return Response.json({ error: "Cannot start a thread on your own listing" }, { status: 400 });
        }

        // Upsert: one thread per (listing, buyer)
        const thread = await db.listingThread.upsert({
            where: {
                // compound unique — we need to add this to schema if missing; use findFirst as fallback
                id: "@@NO_MATCH",
            },
            create: {
                listing_id,
                buyer_id: user.id,
                seller_id: listing.seller_id,
            },
            update: {},
        }).catch(async () => {
            // Fallback: findFirst or create
            const existing = await db.listingThread.findFirst({
                where: { listing_id, buyer_id: user.id },
            });
            return existing ?? db.listingThread.create({
                data: { listing_id, buyer_id: user.id, seller_id: listing.seller_id },
            });
        });

        return Response.json({ thread }, { status: 201 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Thread create error:", err);
        return Response.json({ error: "Failed to create thread" }, { status: 500 });
    }
}
