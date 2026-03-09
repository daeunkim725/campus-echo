import { db } from "@/lib/db";
import { requireAuth, hashToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { user, token } = await requireAuth(request);
        const tokenHash = await hashToken(token);

        await db.tokenDenylist.upsert({
            where: { token_hash: tokenHash },
            create: { token_hash: tokenHash, user_id: user.id },
            update: {},
        });

        const response = Response.json({ message: "Logged out successfully" });
        // Clear the cookie
        response.headers.append(
            "Set-Cookie",
            `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
        );
        return response;
    } catch (err) {
        if (err instanceof Response) return err;
        return Response.json({ error: "Logout failed" }, { status: 500 });
    }
}
