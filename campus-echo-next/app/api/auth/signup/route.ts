import { hashSync } from "bcryptjs";
import { db } from "@/lib/db";
import {
    createJWT,
    generateHandle,
    getAnonId,
    isAdminEmail,
    validateEmail,
    validatePassword,
    COOKIE_NAME,
} from "@/lib/auth";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";

export async function POST(request: Request) {
    // Rate limit: 5 signups per IP per 15 minutes
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const limited = checkRateLimit(rateLimitKey("signup", ip), 5, 15 * 60 * 1000);
    if (limited) return limited;

    try {
        const { email, password, displayName } = await request.json();

        if (!email || !password) {
            return Response.json({ error: "Email and password are required" }, { status: 400 });
        }
        if (!validateEmail(email)) {
            return Response.json({ error: "Invalid email format" }, { status: 400 });
        }
        const pwError = validatePassword(password);
        if (pwError) {
            return Response.json({ error: pwError }, { status: 400 });
        }

        const emailLower = email.toLowerCase();

        const existing = await db.user.findUnique({ where: { email: emailLower } });
        if (existing) {
            return Response.json({ error: "An account with this email already exists" }, { status: 409 });
        }

        const passwordHash = hashSync(password, 10);
        const isAdmin = isAdminEmail(emailLower);

        // Generate unique handle
        let handle = "";
        let unique = false;
        while (!unique) {
            handle = generateHandle();
            const taken = await db.user.findUnique({ where: { handle } });
            if (!taken) unique = true;
        }

        const anonId = await getAnonId(emailLower);

        const user = await db.user.create({
            data: {
                email: emailLower,
                password_hash: passwordHash,
                display_name: displayName || emailLower.split("@")[0],
                handle,
                anon_id: anonId,
                role: isAdmin ? "admin" : "user",
                school_id: isAdmin ? "ETHZ" : null,
                school_verified: isAdmin,
                age_verified: isAdmin,
                verified_at: isAdmin ? new Date() : null,
            },
        });

        const token = await createJWT(user.id, user.email, user.school_id, 24);

        const response = Response.json(
            {
                token,
                user: safeUser(user),
            },
            { status: 201 }
        );

        setTokenCookie(response, token);
        return response;
    } catch (err) {
        console.error("Signup error:", err);
        return Response.json({ error: "Registration failed. Please try again." }, { status: 500 });
    }
}

// ─── Helpers shared with login ─────────────────────────────────────────────

export function safeUser(user: any) {
    return {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        handle: user.handle,
        anon_id: user.anon_id,
        role: user.role,
        school_id: user.school_id,
        school: user.school_id, // alias for frontend compat
        school_email: user.school_email,
        school_verified: user.school_verified,
        age_verified: user.age_verified,
        verified_at: user.verified_at,
        mood: user.mood,
        avatar_base: user.avatar_base,
        avatar_accessory: user.avatar_accessory,
    };
}

export function setTokenCookie(response: Response, token: string) {
    response.headers.append(
        "Set-Cookie",
        `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24}`
    );
}
