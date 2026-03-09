import { db } from "@/lib/db";
import { requireVerified, getAnonId } from "@/lib/auth";

const ALLOWED_STATUSES = ["active", "reserved", "sold", "archived"];

// ─── GET /api/market/listings/[id] ────────────────────────────────────────

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await requireVerified(request);
        const listing = await db.listing.findFirst({
            where: { id: params.id, deleted_at: null, school_id: user.school_id ?? "ETHZ" },
            include: { images: { orderBy: { order_index: "asc" } } },
        });
        if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 });

        const myAnonId = await getAnonId(user.email);
        return Response.json({ listing: { ...listing, is_own_listing: listing.seller_anon_id === myAnonId } });
    } catch (err) {
        if (err instanceof Response) return err;
        return Response.json({ error: "Failed to fetch listing" }, { status: 500 });
    }
}

// ─── PATCH /api/market/listings/[id] ─────────────────────────────────────

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await requireVerified(request);
        const listing = await db.listing.findFirst({ where: { id: params.id, deleted_at: null } });
        if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 });

        const isOwner = listing.seller_id === user.id;
        const isAdmin = user.role === "admin" || user.role === "moderator";
        if (!isOwner && !isAdmin) return Response.json({ error: "Not authorized" }, { status: 403 });

        const body = await request.json();
        const allowedFields = ["title", "description", "price", "is_free", "condition", "pickup_location_tag", "status"];
        const updates: Record<string, unknown> = {};
        for (const key of allowedFields) {
            if (body[key] !== undefined) updates[key] = body[key];
        }
        if (updates.status && !ALLOWED_STATUSES.includes(updates.status as string)) {
            return Response.json({ error: "Invalid status" }, { status: 400 });
        }

        const updated = await db.listing.update({ where: { id: params.id }, data: updates });
        return Response.json({ listing: updated });
    } catch (err) {
        if (err instanceof Response) return err;
        return Response.json({ error: "Failed to update listing" }, { status: 500 });
    }
}

// ─── DELETE /api/market/listings/[id] ────────────────────────────────────

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await requireVerified(request);
        const listing = await db.listing.findFirst({ where: { id: params.id, deleted_at: null } });
        if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 });

        const isOwner = listing.seller_id === user.id;
        const isAdmin = user.role === "admin" || user.role === "moderator";
        if (!isOwner && !isAdmin) return Response.json({ error: "Not authorized" }, { status: 403 });

        await db.listing.update({ where: { id: params.id }, data: { deleted_at: new Date() } });
        return Response.json({ message: "Listing deleted" });
    } catch (err) {
        if (err instanceof Response) return err;
        return Response.json({ error: "Failed to delete listing" }, { status: 500 });
    }
}
