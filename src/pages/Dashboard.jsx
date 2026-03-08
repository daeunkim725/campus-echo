import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Medal, Activity, Database, AlertCircle, Clock } from "lucide-react";

export default function Dashboard() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [leaderboard, setLeaderboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== "admin") return;
        const fetchData = async () => {
            try {
                const statsResponse = await base44.functions.invoke("getSystemStats", {});
                const leaderboardResponse = await base44.functions.invoke("getLeaderboard", { school_id: user.school_id, period: "all_time", limit: 50 });

                setStats(statsResponse);
                setLeaderboard(leaderboardResponse.leaderboard);
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.school_id, isAuthenticated, user?.role]);

    if (!isAuthenticated || user?.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
        );
    }

    const topUser = leaderboard && leaderboard.length > 0 ? leaderboard[0] : null;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
            <button
                onClick={() => navigate("/")} // Normally profile but layout handles nav
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Profile
            </button>

            <h1 className="text-2xl font-bold text-slate-900 mb-6">Observability Dashboard</h1>

            {/* Leaderboard Section (Top 1) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Medal className="w-5 h-5 text-amber-500" /> Current Leader (#1)
                    </h2>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">All-Time</span>
                </div>
                {topUser ? (
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600 text-2xl font-black shadow-inner">
                            #1
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 tracking-tight">{topUser.leaderboard_handle}</p>
                            <p className="text-sm text-slate-500 mt-1">
                                Net Score: <span className="font-bold text-green-600">+{topUser.score}</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">No leaderboard data available.</p>
                )}
            </div>

            {/* System Stats Section */}
            <h2 className="text-lg font-bold text-slate-800 mb-4">System Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">p95 Latency</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats?.p95_latency || "N/A"}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Requests (24h)</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats?.requests_last_24h?.toLocaleString() || "N/A"}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Error Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats?.error_rate || "N/A"}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Database className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">DB Events</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats?.database_events?.toLocaleString() || "N/A"}</p>
                </div>
            </div>

            {/* Full Leaderboard Table */}
            <h2 className="text-lg font-bold text-slate-800 mt-8 mb-4">Top Users</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-slate-600">Rank</th>
                            <th className="px-6 py-3 font-semibold text-slate-600">Handle</th>
                            <th className="px-6 py-3 font-semibold text-slate-600 text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {leaderboard?.map((u) => (
                            <tr key={u.leaderboard_handle} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">#{u.rank}</td>
                                <td className="px-6 py-4 text-slate-700">{u.leaderboard_handle}</td>
                                <td className="px-6 py-4 font-bold text-green-600 text-right">+{u.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
