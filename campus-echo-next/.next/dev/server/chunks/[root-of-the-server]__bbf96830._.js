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
"[project]/campus-echo-next/app/api/leaderboard/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/campus-echo-next/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/campus-echo-next/lib/auth.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    try {
        const { user } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireVerified"])(request);
        const url = new URL(request.url);
        const schoolId = url.searchParams.get("school_id") ?? user.school_id ?? "ETHZ";
        const timeWindow = url.searchParams.get("time_window") ?? "all-time";
        let since;
        if (timeWindow === "today") since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        else if (timeWindow === "week") since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const createdAtFilter = since ? {
            gte: since
        } : undefined;
        // Fetch all data for the school concurrently
        const [posts, comments, listings, users] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].post.findMany({
                where: {
                    school_id: schoolId,
                    deleted_at: null,
                    ...createdAtFilter ? {
                        created_at: createdAtFilter
                    } : {}
                },
                select: {
                    author_anon_id: true,
                    upvotes: true,
                    downvotes: true
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].comment.findMany({
                where: {
                    post: {
                        school_id: schoolId
                    },
                    deleted_at: null,
                    ...createdAtFilter ? {
                        created_at: createdAtFilter
                    } : {}
                },
                select: {
                    author_anon_id: true,
                    upvotes: true,
                    downvotes: true
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].listing.findMany({
                where: {
                    school_id: schoolId,
                    deleted_at: null,
                    ...createdAtFilter ? {
                        created_at: createdAtFilter
                    } : {}
                },
                select: {
                    seller_anon_id: true
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.findMany({
                where: {
                    school_id: schoolId
                },
                select: {
                    id: true,
                    handle: true,
                    anon_id: true,
                    mood: true
                }
            })
        ]);
        // Aggregate by anon_id
        const stats = {};
        for (const u of users){
            if (!u.anon_id) continue;
            stats[u.anon_id] = {
                anon_id: u.anon_id,
                handle: u.handle,
                mood: u.mood,
                points: 0,
                posts_count: 0,
                comments_count: 0,
                listings_count: 0
            };
        }
        for (const p of posts){
            const s = stats[p.author_anon_id];
            if (!s) continue;
            s.posts_count++;
            s.points += (p.upvotes ?? 0) - (p.downvotes ?? 0);
        }
        for (const c of comments){
            const s = stats[c.author_anon_id];
            if (!s) continue;
            s.comments_count++;
            s.points += (c.upvotes ?? 0) - (c.downvotes ?? 0);
        }
        for (const l of listings){
            const s = stats[l.seller_anon_id];
            if (s) s.listings_count++;
        }
        const ranked = Object.values(stats).sort((a, b)=>b.points - a.points || b.posts_count - a.posts_count).slice(0, 50).map((item, i)=>({
                ...item,
                rank: i + 1
            }));
        const myAnonId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAnonId"])(user.email);
        const myEntry = ranked.find((r)=>r.anon_id === myAnonId) ?? null;
        return Response.json({
            leaderboard: ranked,
            myRank: myEntry,
            school_id: schoolId,
            time_window: timeWindow
        });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("Leaderboard error:", err);
        return Response.json({
            error: "Failed to fetch leaderboard"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bbf96830._.js.map