import { db } from "@/lib/db";
import { requireVerified } from "@/lib/auth";

// ─── GET /api/market/threads/[id]/messages ─────────────────────────────────

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await requireVerified(request);

        const thread = await db.listingThread.findUnique({ where: { id: params.id } });
        if (!thread) return Response.json({ error: "Thread not found" }, { status: 404 });

        const canAccess = thread.buyer_id === user.id || thread.seller_id === user.id || user.role === "admin";
        if (!canAccess) return Response.json({ error: "Not authorized" }, { status: 403 });

        const messages = await db.listingMessage.findMany({
            where: { thread_id: params.id },
            orderBy: { created_at: "asc" },
        });

        // Mark messages as read for this user
        const myRole = thread.buyer_id === user.id ? "buyer" : "seller";
        const unread = messages.filter((m) => m.sender_role !== myRole && !m.read).map((m) => m.id);
        if (unread.length > 0) {
            await db.listingMessage.updateMany({
                where: { id: { in: unread } },
                data: { read: true },
            });
        }

        return Response.json({ messages, thread });
    } catch (err) {
        if (err instanceof Response) return err;
        return Response.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

// ─── POST /api/market/threads/[id]/messages ────────────────────────────────

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await requireVerified(request);

        const thread = await db.listingThread.findUnique({ where: { id: params.id } });
        if (!thread) return Response.json({ error: "Thread not found" }, { status: 404 });

        const canAccess = thread.buyer_id === user.id || thread.seller_id === user.id;
        if (!canAccess) return Response.json({ error: "Not authorized" }, { status: 403 });

        const { content } = await request.json();
        if (!content || content.trim().length === 0) {
            return Response.json({ error: "Content is required" }, { status: 400 });
        }

        const senderRole = thread.buyer_id === user.id ? "buyer" : "seller";

        const message = await db.listingMessage.create({
            data: {
                thread_id: params.id,
                sender_id: user.id,
                sender_role: senderRole,
                content: content.trim(),
            },
        });

        await db.listingThread.update({
            where: { id: params.id },
            data: { updated_at: new Date() },
        });

        return Response.json({ message }, { status: 201 });
    } catch (err) {
        if (err instanceof Response) return err;
        return Response.json({ error: "Failed to send message" }, { status: 500 });
    }
}
