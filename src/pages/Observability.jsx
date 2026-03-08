import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { apiLeaderboard } from "@/api/apiClient";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Activity, Users, FileText, ShieldAlert, BarChart3, AlertCircle, Clock, MessageCircle, Award } from "lucide-react";

export default function Observability() {
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    comments: 0,
    reports: 0
  });
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState(null);

  // Mock data for API metrics and logs since we rely on standard output for the real ones
  const [apiMetrics] = useState({
    latency: "34ms",
    requests: "12,450",
    errorRate: "0.12%"
  });

  const [recentErrors] = useState([
    { id: 1, time: "2 mins ago", route: "marketCreateListing", message: "Invalid image format" },
    { id: 2, time: "15 mins ago", route: "authLogin", message: "Rate limit exceeded" },
    { id: 3, time: "1 hour ago", route: "feedCreate", message: "Database timeout" }
  ]);

  const [auditLogs] = useState([
    { id: 1, time: "10 mins ago", admin: "admin@campusecho.app", action: "Deleted Post", target: "Post #452" },
    { id: 2, time: "45 mins ago", admin: "admin@campusecho.app", action: "Dismissed Report", target: "Comment #892" },
    { id: 3, time: "2 hours ago", admin: "mod@campusecho.app", action: "Banned User", target: "user@school.ch" }
  ]);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.role !== 'admin') {
        window.location.href = createPageUrl("Home");
      } else {
        fetchStats();
      }
    }).catch(() => {
        window.location.href = createPageUrl("Home");
    });
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [users, posts, comments, reports, leaderboard] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Post.list(),
        base44.entities.Comment.list(),
        base44.entities.Report.list(),
        apiLeaderboard().catch(() => null)
      ]);
      setStats({
        users: users.length,
        posts: posts.length,
        comments: comments.length,
        reports: reports.length
      });
      // Always set leaderboardData so the section is visible
      setLeaderboardData(leaderboard || { handle: "No Data", score: 0 });
    } catch (err) {
      console.error("Failed to fetch stats", err);
      // @ts-ignore
      if (window.base44_mock_mode) {
          setStats({ users: 142, posts: 89, comments: 412, reports: 3 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-500 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-indigo-500" />
              Observability Dashboard
            </h1>
            <p className="text-sm text-slate-500">System health, metrics, and event counts.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Leaderboard */}
            {leaderboardData && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between mb-6">
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-6 h-6 text-amber-500" />
                      <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">#1 User Leaderboard</span>
                      <span className="text-[10px] font-medium text-amber-500/80 bg-amber-100 px-2 py-0.5 rounded-full ml-1">All-time</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 mt-1">{leaderboardData.handle || "N/A"}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-3xl font-black text-amber-600">{leaderboardData.score || 0}</p>
                    <p className="text-xs font-semibold text-amber-600/70 uppercase">Net Votes</p>
                 </div>
              </div>
            )}

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                 <div>
                    <p className="text-sm font-medium text-slate-500">Avg Latency (p95)</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{apiMetrics.latency}</p>
                 </div>
                 <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                    <Clock className="w-6 h-6" />
                 </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                 <div>
                    <p className="text-sm font-medium text-slate-500">Requests (24h)</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{apiMetrics.requests}</p>
                 </div>
                 <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                    <BarChart3 className="w-6 h-6" />
                 </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                 <div>
                    <p className="text-sm font-medium text-slate-500">Error Rate</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{apiMetrics.errorRate}</p>
                 </div>
                 <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                    <AlertCircle className="w-6 h-6" />
                 </div>
              </div>
            </div>

            {/* Entity Counts */}
            <h2 className="text-lg font-bold text-slate-800 mt-8 mb-4">Database Events</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <Users className="w-5 h-5 text-indigo-400 mb-2" />
                  <p className="text-2xl font-bold text-slate-800">{stats.users}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Users</p>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <FileText className="w-5 h-5 text-sky-400 mb-2" />
                  <p className="text-2xl font-bold text-slate-800">{stats.posts}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Posts</p>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <MessageCircle className="w-5 h-5 text-emerald-400 mb-2" />
                  <p className="text-2xl font-bold text-slate-800">{stats.comments}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Comments</p>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <ShieldAlert className="w-5 h-5 text-red-400 mb-2" />
                  <p className="text-2xl font-bold text-slate-800">{stats.reports}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Reports</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Recent API Errors */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            Recent API Errors
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentErrors.map(err => (
                            <div key={err.id} className="p-4 flex flex-col gap-1 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{err.route}</span>
                                    <span className="text-xs text-slate-400">{err.time}</span>
                                </div>
                                <p className="text-sm text-red-600 font-medium mt-1">{err.message}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Moderation Audit Log */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-orange-500" />
                            Moderation Audit Log
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {auditLogs.map(log => (
                            <div key={log.id} className="p-4 flex flex-col gap-1 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-semibold text-slate-800">{log.action}</span>
                                    <span className="text-xs text-slate-400">{log.time}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-slate-500">by {log.admin}</span>
                                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{log.target}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}