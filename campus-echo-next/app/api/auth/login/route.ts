import { compareSync } from "bcryptjs";
import { db } from "@/lib/db";
import { createJWT, generateHandle, getAnonId, validateEmail, COOKIE_NAME } from "@/lib/auth";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { safeUser, setTokenCookie } from "../signup/route";

export async function POST(request: Request) {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const limited = checkRateLimit(rateLimitKey("login", ip), 10, 15 * 60 * 1000);
    if (limited) return limited;

    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return Response.json({ error: "Email and password are required" }, { status: 400 });
        }
        if (!validateEmail(email)) {
            return Response.json({ error: "Invalid email format" }, { status: 400 });
        }

        const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

        if (!user || !user.password_hash) {
            return Response.json({ error: "Invalid email or password" }, { status: 401 });
        }

        if (!compareSync(password, user.password_hash)) {
            return Response.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // Migrate: fill in missing handle / anon_id
        const updates: Record<string, string> = {};
        if (!user.handle) {
            let handle = "";
            let unique = false;
            while (!unique) {
                handle = generateHandle();
                const taken = await db.user.findUnique({ where: { handle } });
                if (!taken) unique = true;
            }
            updates.handle = handle;
        }
        if (!user.anon_id) {
            updates.anon_id = await getAnonId(user.email);
        }
        const finalUser =
            Object.keys(updates).length > 0
                ? await db.user.update({ where: { id: user.id }, data: updates })
                : user;

        const token = await createJWT(finalUser.id, finalUser.email, finalUser.school_id, 24);

        const response = Response.json({ token, user: safeUser(finalUser) });
        setTokenCookie(response, token);
        return response;
    } catch (err) {
        console.error("Login error:", err);
        return Response.json({ error: "Login failed. Please try again." }, { status: 500 });
    }
}
