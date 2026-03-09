"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import NavBar from "@/components/NavBar";
import { leaderboard as lbApi } from "@/lib/apiClient";
import { Trophy, FileText, MessageCircle, ShoppingBag, Users, Award } from "lucide-react";

interface LbEntry {
    rank: number;
    handle: string;
    anon_id: string;
    points: number;
    posts_count: number;
    comments_count: number;
    listings_count: number;
}

const TIME_FILTERS = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "All-time", value: "all-time" },
];

export default function LeaderboardPage() {
    const { user, isLoadingAuth } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const schoolCode = searchParams.get("school") || user?.school_id || "ETHZ";

    const [entries, setEntries] = useState<LbEntry[]>([]);
    const [myRank, setMyRank] = useState<LbEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeWindow, setTimeWindow] = useState("all-time");

    useEffect(() => {
        if (!isLoadingAuth && !user) router.replace("/login");
    }, [user, isLoadingAuth, router]);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        lbApi.get(schoolCode, timeWindow).then((data: any) => {
            setEntries(data.leaderboard ?? []);
            setMyRank(data.myRank ?? null);
        }).catch(console.error).finally(() => setLoading(false));
    }, [schoolCode, timeWindow, user]);

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: "#F6F8FC" }}>
            <NavBar />

            <div className="max-w-xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Trophy className="w-7 h-7 text-amber-500" />
                            Leaderboard
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">Top contributors at {schoolCode}</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {TIME_FILTERS.map((f) => (
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

                {/* My rank card */}
                {myRank && (
                    <div className="mb-8 p-0.5 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-400">
                        <div className="bg-white rounded-[22px] p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black bg-blue-50 text-blue-600">
                                        #{myRank.rank}
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
                                <div className="text-center"><p className="text-sm font-bold text-slate-800">{myRank.posts_count}</p><p className="text-[9px] font-bold text-slate-400 uppercase">Posts</p></div>
                                <div className="text-center border-x border-slate-50"><p className="text-sm font-bold text-slate-800">{myRank.comments_count}</p><p className="text-[9px] font-bold text-slate-400 uppercase">Comments</p></div>
                                <div className="text-center"><p className="text-sm font-bold text-slate-800">{myRank.listings_count}</p><p className="text-[9px] font-bold text-slate-400 uppercase">Listings</p></div>
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
                                    <div className="flex items-center gap-4"><div className="w-8 h-8 rounded-lg bg-slate-200" /><div className="h-4 w-24 bg-slate-200 rounded" /></div>
                                    <div className="h-4 w-12 bg-slate-200 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Users className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-bold">No data for this period</p>
                            <p className="text-slate-400 text-xs mt-1">Be the first to contribute!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {entries.map((entry) => (
                                <div
                                    key={entry.anon_id}
                                    className={`p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors ${entry.anon_id === myRank?.anon_id ? "bg-amber-50/30" : ""}`}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${entry.rank === 1 ? "bg-amber-100 text-amber-600" : entry.rank === 2 ? "bg-slate-200 text-slate-600" : entry.rank === 3 ? "bg-orange-100 text-orange-600" : "bg-slate-50 text-slate-400"
                                            }`}>
                                            {entry.rank}
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-bold text-slate-900 truncate">{entry.handle}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[9px] text-slate-400 flex items-center gap-0.5"><FileText className="w-2.5 h-2.5" /> {entry.posts_count}</span>
                                                <span className="text-[9px] text-slate-400 flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" /> {entry.comments_count}</span>
                                                {entry.listings_count > 0 && <span className="text-[9px] text-slate-400 flex items-center gap-0.5"><ShoppingBag className="w-2.5 h-2.5" /> {entry.listings_count}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-900">{entry.points}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">points</p>
                                        </div>
                                        {entry.rank <= 3 && <Award className={`w-4 h-4 ${entry.rank === 1 ? "text-amber-500" : entry.rank === 2 ? "text-slate-400" : "text-orange-400"}`} />}
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
