module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/campus-echo-next/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/campus-echo-next/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const db = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        "query",
        "error"
    ] : "TURBOPACK unreachable"
});
if ("TURBOPACK compile-time truthy", 1) {
    globalForPrisma.prisma = db;
}
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[project]/campus-echo-next/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "COOKIE_NAME",
    ()=>COOKIE_NAME,
    "SCHOOL_DOMAINS",
    ()=>SCHOOL_DOMAINS,
    "calculateHotScore",
    ()=>calculateHotScore,
    "createJWT",
    ()=>createJWT,
    "detectSchoolFromEmail",
    ()=>detectSchoolFromEmail,
    "extractToken",
    ()=>extractToken,
    "generateHandle",
    ()=>generateHandle,
    "getAnonId",
    ()=>getAnonId,
    "hashToken",
    ()=>hashToken,
    "isAdminEmail",
    ()=>isAdminEmail,
    "isValidSchoolEmail",
    ()=>isValidSchoolEmail,
    "requireAuth",
    ()=>requireAuth,
    "requireVerified",
    ()=>requireVerified,
    "validateEmail",
    ()=>validateEmail,
    "validatePassword",
    ()=>validatePassword,
    "verifyJWT",
    ()=>verifyJWT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$jose$2f$dist$2f$node$2f$esm$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/campus-echo-next/node_modules/jose/dist/node/esm/jwt/sign.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$jose$2f$dist$2f$node$2f$esm$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/campus-echo-next/node_modules/jose/dist/node/esm/jwt/verify.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/campus-echo-next/lib/db.ts [app-route] (ecmascript)");
;
;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "fallback-dev-secret-min-32-chars-long");
const COOKIE_NAME = "campus_echo_token";
const SCHOOL_DOMAINS = {
    ETHZ: [
        "ethz.ch",
        "student.ethz.ch"
    ],
    UZH: [
        "uzh.ch",
        "access.uzh.ch"
    ],
    EPFL: [
        "epfl.ch"
    ]
};
function isValidSchoolEmail(email, schoolCode) {
    const domains = SCHOOL_DOMAINS[schoolCode];
    if (!domains) return false;
    const domain = email.split("@")[1]?.toLowerCase();
    return domains.map((d)=>d.toLowerCase()).includes(domain ?? "");
}
function detectSchoolFromEmail(email) {
    const domain = email.split("@")[1]?.toLowerCase() ?? "";
    for (const [school, domains] of Object.entries(SCHOOL_DOMAINS)){
        if (domains.map((d)=>d.toLowerCase()).includes(domain)) return school;
    }
    return null;
}
async function createJWT(userId, email, schoolId, expiryHours = 24) {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$jose$2f$dist$2f$node$2f$esm$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"]({
        userId,
        email,
        schoolId
    }).setProtectedHeader({
        alg: "HS256"
    }).setIssuedAt().setExpirationTime(`${expiryHours}h`).sign(JWT_SECRET);
}
async function verifyJWT(token) {
    const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$jose$2f$dist$2f$node$2f$esm$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(token, JWT_SECRET);
    return payload;
}
async function hashToken(token) {
    const data = new TextEncoder().encode(token);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf)).map((b)=>b.toString(16).padStart(2, "0")).join("");
}
async function getAnonId(email) {
    const data = new TextEncoder().encode("ce:" + email.toLowerCase());
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf)).map((b)=>b.toString(16).padStart(2, "0")).join("").substring(0, 16);
}
// ─── Handle generator ────────────────────────────────────────────────────────
const ADJECTIVES = [
    "swift",
    "brave",
    "calm",
    "dark",
    "epic",
    "fast",
    "gold",
    "jade",
    "keen",
    "lunar"
];
const NOUNS = [
    "bat",
    "echo",
    "fox",
    "hawk",
    "iris",
    "jade",
    "kite",
    "lynx",
    "mist",
    "nova"
];
function generateHandle() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${adj}_${noun}_${num}`;
}
function extractToken(request) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }
    // Also check cookie
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
        const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
        if (match) return match[1];
    }
    return null;
}
async function requireAuth(request) {
    const token = extractToken(request);
    if (!token) {
        throw Response.json({
            error: "Authentication required"
        }, {
            status: 401
        });
    }
    let payload;
    try {
        payload = await verifyJWT(token);
    } catch  {
        throw Response.json({
            error: "Invalid or expired token"
        }, {
            status: 401
        });
    }
    // Check denylist
    const tokenHash = await hashToken(token);
    const denylisted = await __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].tokenDenylist.findUnique({
        where: {
            token_hash: tokenHash
        }
    });
    if (denylisted) {
        throw Response.json({
            error: "Token has been revoked"
        }, {
            status: 401
        });
    }
    // Load user
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.findUnique({
        where: {
            id: payload.userId
        }
    });
    if (!user) {
        throw Response.json({
            error: "User not found"
        }, {
            status: 401
        });
    }
    return {
        user,
        token,
        payload
    };
}
async function requireVerified(request) {
    const { user, token, payload } = await requireAuth(request);
    if (!user.school_verified) {
        throw Response.json({
            error: "School email not verified. Please complete onboarding."
        }, {
            status: 403
        });
    }
    if (!user.age_verified) {
        throw Response.json({
            error: "Age not verified. Please complete onboarding."
        }, {
            status: 403
        });
    }
    return {
        user,
        token,
        payload
    };
}
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(password) {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain a number";
    return null;
}
// ─── Admin email check ────────────────────────────────────────────────────────
const ADMIN_EMAILS = new Set([
    "admin@campusecho.app",
    "daeunkim725@gmail.com",
    "daeunkim@gmail.com",
    "daeun.kim725@gmail.com"
]);
const ADMIN_DOMAIN = "@campusecho.app";
function isAdminEmail(email) {
    const lower = email.toLowerCase();
    return lower.endsWith(ADMIN_DOMAIN) || ADMIN_EMAILS.has(lower);
}
function calculateHotScore(up, down, createdAtMs) {
    const ageHours = (Date.now() - createdAtMs) / (1000 * 60 * 60);
    return (up - down) / Math.pow(ageHours + 2, 1.5);
}
}),
"[project]/campus-echo-next/lib/rateLimit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkRateLimit",
    ()=>checkRateLimit,
    "rateLimitKey",
    ()=>rateLimitKey
]);
// In-memory store — works fine for single-process dev/staging
// For production with multiple workers, replace with Redis
const store = new Map();
function checkRateLimit(key, limit, windowMs) {
    const now = Date.now();
    const entry = store.get(key);
    if (!entry || entry.resetAt < now) {
        store.set(key, {
            count: 1,
            resetAt: now + windowMs
        });
        return null;
    }
    if (entry.count >= limit) {
        return Response.json({
            error: "Too many requests. Please try again later."
        }, {
            status: 429,
            headers: {
                "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000))
            }
        });
    }
    entry.count++;
    return null;
}
function rateLimitKey(namespace, identifier) {
    return `${namespace}:${identifier}`;
}
}),
"[project]/campus-echo-next/app/api/auth/signup/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "safeUser",
    ()=>safeUser,
    "setTokenCookie",
    ()=>setTokenCookie
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/campus-echo-next/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/campus-echo-next/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/campus-echo-next/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$rateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/campus-echo-next/lib/rateLimit.ts [app-route] (ecmascript)");
;
;
;
;
async function POST(request) {
    // Rate limit: 5 signups per IP per 15 minutes
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const limited = (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$rateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkRateLimit"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$rateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rateLimitKey"])("signup", ip), 5, 15 * 60 * 1000);
    if (limited) return limited;
    try {
        const { email, password, displayName } = await request.json();
        if (!email || !password) {
            return Response.json({
                error: "Email and password are required"
            }, {
                status: 400
            });
        }
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateEmail"])(email)) {
            return Response.json({
                error: "Invalid email format"
            }, {
                status: 400
            });
        }
        const pwError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validatePassword"])(password);
        if (pwError) {
            return Response.json({
                error: pwError
            }, {
                status: 400
            });
        }
        const emailLower = email.toLowerCase();
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.findUnique({
            where: {
                email: emailLower
            }
        });
        if (existing) {
            return Response.json({
                error: "An account with this email already exists"
            }, {
                status: 409
            });
        }
        const passwordHash = (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashSync"])(password, 10);
        const isAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdminEmail"])(emailLower);
        // Generate unique handle
        let handle = "";
        let unique = false;
        while(!unique){
            handle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateHandle"])();
            const taken = await __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.findUnique({
                where: {
                    handle
                }
            });
            if (!taken) unique = true;
        }
        const anonId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAnonId"])(emailLower);
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.create({
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
                verified_at: isAdmin ? new Date() : null
            }
        });
        const token = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createJWT"])(user.id, user.email, user.school_id, 24);
        const response = Response.json({
            token,
            user: safeUser(user)
        }, {
            status: 201
        });
        setTokenCookie(response, token);
        return response;
    } catch (err) {
        console.error("Signup error:", err);
        return Response.json({
            error: "Registration failed. Please try again."
        }, {
            status: 500
        });
    }
}
function safeUser(user) {
    return {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        handle: user.handle,
        anon_id: user.anon_id,
        role: user.role,
        school_id: user.school_id,
        school: user.school_id,
        school_email: user.school_email,
        school_verified: user.school_verified,
        age_verified: user.age_verified,
        verified_at: user.verified_at,
        mood: user.mood,
        avatar_base: user.avatar_base,
        avatar_accessory: user.avatar_accessory
    };
}
function setTokenCookie(response, token) {
    response.headers.append("Set-Cookie", `${__TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COOKIE_NAME"]}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24}`);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__043952d3._.js.map