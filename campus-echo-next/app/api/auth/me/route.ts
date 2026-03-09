import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { safeUser } from "../signup/route";

export async function GET(request: Request) {
    try {
        const { user } = await requireAuth(request);
        return Response.json(safeUser(user));
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Auth me error:", err);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
