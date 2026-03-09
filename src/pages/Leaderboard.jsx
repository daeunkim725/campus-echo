import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { apiLeaderboard } from "@/api/apiClient";
import { createPageUrl } from "@/utils";
import SchoolTopBar from "@/components/feed/SchoolTopBar";
import { getSchoolConfig } from "@/components/utils/schoolConfig";
import { useThemeTokens } from "@/components/utils/ThemeProvider";
import { Award, TrendingUp, Clock, Users, MessageCircle, FileText, ShoppingBag, Trophy, ArrowUp } from "lucide-react";

export default function Leaderboard() {
    const params = new URLSearchParams(window.location.search);
    const schoolCode = params.get("school") || "ETHZ";

    const [leaderboard, setLeaderboard] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeWindow, setTimeWindow] = useState("all-time"); // today, week, all-time
    const [currentUser, setCurrentUser] = useState(null);

    const schoolConfig = getSchoolConfig(schoolCode);
    const tokens = useThemeTokens(schoolConfig);

    useEffect(() => {
        base44.auth.me().then(u => {
            setCurrentUser(u);
            // Optional: enforce school match for non-admins
            if (u?.role !== "admin" && u?.school && u.school !== schoolCode) {
                // Redirect to their own school leaderboard
                window.location.replace(createPageUrl("Leaderboard") + `?school=${u.school}`);
            }
        }).catch(() => {
            base44.auth.redirectToLogin(createPageUrl("Leaderboard") + `?school=${schoolCode}`);
        });
    }, [schoolCode]);

    useEffect(() => {
        fetchLeaderboard();
    }, [schoolCode, timeWindow]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const data = await apiLeaderboard(schoolCode, timeWindow);
            setLeaderboard(data.leaderboard || []);
            setMyRank(data.myRank || null);
        } catch (err) {
            console.error("Leaderboard fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const timeFilters = [
        { label: "Today", value: "today" },
        { label: "This Week", value: "week" },
        { label: "All-time", value: "all-time" }
    ];

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: tokens.bg }}>
            <SchoolTopBar
                currentUser={currentUser}
                onUserUpdate={u => setCurrentUser(u)}
                onPost={() => window.location.href = createPageUrl("SchoolFeed") + `?school=${schoolCode}`}
                activePage="stats"
                schoolConfig={schoolConfig}
                schoolCode={schoolCode}
                hideFABs={true}
                alwaysSticky={true}
            />

            <div className="max-w-xl mx-auto px-4 py-6">
                {/* Header Stats */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Trophy className="w-7 h-7 text-amber-500" />
                            Leaderboard
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">Top contributors at {schoolConfig.name}</p>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {timeFilters.map(f => (
                            <button
                                key={f.value}
                                onClick={() => setTimeWindow(f.value)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${timeWindow === f.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* My Rank Section */}
                {myRank && (
                    <div className="mb-8 p-0.5 rounded-3xl" style={{ background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.primary}88)` }}>
                        <div className="bg-white rounded-[22px] p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black" style={{ backgroundColor: tokens.primaryLight, color: tokens.primary }}>
                                        {myRank.rank > 50 ? "50+" : `#${myRank.rank}`}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">My Rank</p>
                                        <h3 className="text-lg font-black text-slate-900 leading-none">{myRank.handle}</h3>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-slate-900 leading-none">{myRank.points}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Pts</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-50">
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-800">{myRank.posts_count}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Posts</p>
                                </div>
                                <div className="text-center border-x border-slate-50">
                                    <p className="text-sm font-bold text-slate-800">{myRank.comments_count}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Comments</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-800">{myRank.listings_count}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Listings</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="divide-y divide-slate-50">
                            {Array(8).fill(0).map((_, i) => (
                                <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100" />
                                        <div className="h-4 w-24 bg-slate-100 rounded" />
                                    </div>
                                    <div className="h-4 w-12 bg-slate-100 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Users className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-bold">No data for this period</p>
                            <p className="text-slate-400 text-xs mt-1">Be the first to contribute!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {leaderboard.map((user, idx) => (
                                <div key={user.id || idx} className={`p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors ${user.anon_id === myRank?.anon_id ? 'bg-amber-50/30' : ''}`}>
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${user.rank === 1 ? 'bg-amber-100 text-amber-600' :
                                                user.rank === 2 ? 'bg-slate-200 text-slate-600' :
                                                    user.rank === 3 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'
                                            }`}>
                                            {user.rank}
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-bold text-slate-900 truncate">{user.handle}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[9px] text-slate-400 flex items-center gap-0.5"><FileText className="w-2.5 h-2.5" /> {user.posts_count}</span>
                                                <span className="text-[9px] text-slate-400 flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" /> {user.comments_count}</span>
                                                {user.listings_count > 0 && <span className="text-[9px] text-slate-400 flex items-center gap-0.5"><ShoppingBag className="w-2.5 h-2.5" /> {user.listings_count}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-900">{user.points}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">points</p>
                                        </div>
                                        {user.rank <= 3 && <Award className={`w-4 h-4 ${user.rank === 1 ? 'text-amber-500' : user.rank === 2 ? 'text-slate-400' : 'text-orange-400'}`} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
