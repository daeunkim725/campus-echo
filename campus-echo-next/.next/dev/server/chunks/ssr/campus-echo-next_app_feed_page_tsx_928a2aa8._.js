module.exports = [
"[project]/campus-echo-next/app/feed/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FeedPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/campus-echo-next/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/campus-echo-next/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/campus-echo-next/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/campus-echo-next/lib/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$apiClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/campus-echo-next/lib/apiClient.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const MOOD_EMOJI = {
    chill: "😌",
    excited: "🤩",
    stressed: "😰",
    happy: "😊",
    sad: "😔",
    curious: "🤔",
    tired: "😴",
    focused: "🎯",
    confused: "😵"
};
const CATEGORY_COLOR = {
    general: "bg-slate-100 text-slate-600",
    events: "bg-purple-100 text-purple-700",
    study: "bg-blue-100 text-blue-700",
    housing: "bg-amber-100 text-amber-700",
    food: "bg-orange-100 text-orange-700",
    sports: "bg-green-100 text-green-700"
};
function FeedPage() {
    const { user, isLoadingAuth, logout } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [posts, setPosts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [sort, setSort] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("new");
    const [newContent, setNewContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [posting, setPosting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Auth guard
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isLoadingAuth) return;
        if (!user) {
            router.replace("/login");
            return;
        }
        if (!user.school_verified) {
            router.replace("/onboarding/school");
            return;
        }
        if (!user.age_verified) {
            router.replace("/onboarding/age");
            return;
        }
    }, [
        user,
        isLoadingAuth,
        router
    ]);
    const loadFeed = async ()=>{
        setLoading(true);
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$apiClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["feed"].list({
                sort,
                limit: 20
            });
            setPosts(data.posts ?? []);
        } catch (e) {
            console.error(e);
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (user?.age_verified) loadFeed();
    }, [
        sort,
        user
    ]);
    const handleVote = async (postId, value)=>{
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$apiClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["votes"].vote("post", postId, value);
            setPosts((prev)=>prev.map((p)=>p.id === postId ? {
                        ...p,
                        upvotes: res.upvotes,
                        downvotes: res.downvotes,
                        user_vote: value
                    } : p));
        } catch (e) {
            console.error(e);
        }
    };
    const handlePost = async ()=>{
        if (!newContent.trim()) return;
        setPosting(true);
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$lib$2f$apiClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["feed"].create({
                content: newContent.trim(),
                category: "general"
            });
            setNewContent("");
            loadFeed();
        } catch (e) {
            console.error(e);
        } finally{
            setPosting(false);
        }
    };
    const timeAgo = (ts)=>{
        const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
        if (s < 60) return "now";
        if (s < 3600) return `${Math.floor(s / 60)}m`;
        if (s < 86400) return `${Math.floor(s / 3600)}h`;
        return `${Math.floor(s / 86400)}d`;
    };
    if (isLoadingAuth || !user) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-slate-50 flex items-center justify-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin"
        }, void 0, false, {
            fileName: "[project]/campus-echo-next/app/feed/page.tsx",
            lineNumber: 100,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/campus-echo-next/app/feed/page.tsx",
        lineNumber: 99,
        columnNumber: 9
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-slate-50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-xl mx-auto px-4 py-3 flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-lg",
                                    children: "🦇"
                                }, void 0, false, {
                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                    lineNumber: 110,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-black text-slate-900 text-sm tracking-tight",
                                    children: "Campus Echo"
                                }, void 0, false, {
                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                    lineNumber: 111,
                                    columnNumber: 25
                                }, this),
                                user.school_id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium",
                                    children: user.school_id
                                }, void 0, false, {
                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                    lineNumber: 113,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                            lineNumber: 109,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs text-slate-500 font-mono",
                                    children: [
                                        "@",
                                        user.handle
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                    lineNumber: 117,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>logout(),
                                    className: "text-xs text-slate-400 hover:text-red-500 transition-colors",
                                    children: "Sign out"
                                }, void 0, false, {
                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                    lineNumber: 118,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                            lineNumber: 116,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                    lineNumber: 108,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                lineNumber: 107,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-xl mx-auto px-4 py-4 space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-base shrink-0",
                                        children: MOOD_EMOJI[user.mood ?? "chill"] ?? "😌"
                                    }, void 0, false, {
                                        fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                        lineNumber: 127,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        value: newContent,
                                        onChange: (e)=>setNewContent(e.target.value),
                                        placeholder: "What's on your mind?",
                                        rows: 3,
                                        className: "flex-1 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none"
                                    }, void 0, false, {
                                        fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                        lineNumber: 130,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                lineNumber: 126,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-end",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handlePost,
                                    disabled: !newContent.trim() || posting,
                                    className: "bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 shadow-sm",
                                    children: posting ? "Posting…" : "Post"
                                }, void 0, false, {
                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                    lineNumber: 139,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                lineNumber: 138,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                        lineNumber: 125,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex bg-white border border-slate-100 shadow-sm p-1 rounded-xl",
                        children: [
                            "new",
                            "hot",
                            "top"
                        ].map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setSort(s),
                                className: `flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${sort === s ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-900"}`,
                                children: s.charAt(0).toUpperCase() + s.slice(1)
                            }, s, false, {
                                fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                lineNumber: 152,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                        lineNumber: 150,
                        columnNumber: 17
                    }, this),
                    loading ? Array(4).fill(0).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-2xl border border-slate-100 p-4 animate-pulse space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-3 bg-slate-100 rounded w-3/4"
                                }, void 0, false, {
                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                    lineNumber: 167,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-3 bg-slate-100 rounded w-1/2"
                                }, void 0, false, {
                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                    lineNumber: 168,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                            lineNumber: 166,
                            columnNumber: 25
                        }, this)) : posts.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-20 bg-white rounded-2xl border border-slate-100",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-4xl mb-3",
                                children: "👻"
                            }, void 0, false, {
                                fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                lineNumber: 173,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-slate-500 font-medium text-sm",
                                children: "No posts yet. Be the first!"
                            }, void 0, false, {
                                fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                lineNumber: 174,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                        lineNumber: 172,
                        columnNumber: 21
                    }, this) : posts.map((post)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm",
                                            children: MOOD_EMOJI[post.author_mood ?? "chill"] ?? "😌"
                                        }, void 0, false, {
                                            fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                            lineNumber: 181,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-semibold text-slate-700",
                                                    children: post.is_own_post ? "You" : `@${post.author_anon_id.substring(0, 8)}`
                                                }, void 0, false, {
                                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                                    lineNumber: 185,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-slate-400",
                                                    children: timeAgo(post.created_at)
                                                }, void 0, false, {
                                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                                    lineNumber: 186,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                            lineNumber: 184,
                                            columnNumber: 33
                                        }, this),
                                        post.category !== "general" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLOR[post.category] ?? CATEGORY_COLOR.general}`,
                                            children: post.category
                                        }, void 0, false, {
                                            fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                            lineNumber: 189,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                    lineNumber: 180,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-slate-800 leading-relaxed",
                                    children: post.content
                                }, void 0, false, {
                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                    lineNumber: 196,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-4 pt-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleVote(post.id, post.user_vote === 1 ? 0 : 1),
                                                    className: `w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all active:scale-90 ${post.user_vote === 1 ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`,
                                                    children: "↑"
                                                }, void 0, false, {
                                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                                    lineNumber: 201,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-semibold text-slate-700 min-w-[1.5rem] text-center",
                                                    children: post.upvotes - post.downvotes
                                                }, void 0, false, {
                                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                                    lineNumber: 206,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleVote(post.id, post.user_vote === -1 ? 0 : -1),
                                                    className: `w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all active:scale-90 ${post.user_vote === -1 ? "bg-red-50 text-red-500" : "text-slate-400 hover:text-red-500 hover:bg-red-50"}`,
                                                    children: "↓"
                                                }, void 0, false, {
                                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                                    lineNumber: 209,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                            lineNumber: 200,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm",
                                                    children: "💬"
                                                }, void 0, false, {
                                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                                    lineNumber: 216,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$campus$2d$echo$2d$next$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-medium",
                                                    children: post.comment_count
                                                }, void 0, false, {
                                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                                    lineNumber: 217,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                            lineNumber: 215,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                                    lineNumber: 199,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, post.id, true, {
                            fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                            lineNumber: 178,
                            columnNumber: 25
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/campus-echo-next/app/feed/page.tsx",
                lineNumber: 123,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/campus-echo-next/app/feed/page.tsx",
        lineNumber: 105,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=campus-echo-next_app_feed_page_tsx_928a2aa8._.js.map