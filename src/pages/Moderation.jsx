import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Trash2, ArrowLeft } from "lucide-react";

export default function Moderation() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState({}); // id -> data

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.role !== 'admin') {
        window.location.href = createPageUrl("Home");
      } else {
        fetchReports();
      }
    });
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const data = await base44.entities.Report.filter({ status: "pending" }, "-created_date", 100);
    setReports(data);
    
    const newTargets = {};
    for (const r of data) {
      if (!newTargets[r.target_id]) {
        try {
          if (r.target_type === "post") {
            newTargets[r.target_id] = await base44.entities.Post.get(r.target_id);
          } else {
            newTargets[r.target_id] = await base44.entities.Comment.get(r.target_id);
          }
        } catch {
          newTargets[r.target_id] = { content: "[Content not found or already deleted]" };
        }
      }
    }
    setTargets(newTargets);
    setLoading(false);
  };

  const handleAction = async (report, action) => {
    if (action === 'delete') {
      if (report.target_type === "post") {
        await base44.entities.Post.update(report.target_id, { deleted: true });
      } else {
        await base44.entities.Comment.update(report.target_id, { deleted: true });
      }
    }
    await base44.entities.Report.update(report.id, { status: action === 'delete' ? 'resolved' : 'dismissed' });

    // Log audit action to backend
    try {
        const token = localStorage.getItem("campus_echo_token");
        await fetch("/api/functions/auditLogCreate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                action: action === 'delete' ? "DELETED_CONTENT" : "DISMISSED_REPORT",
                target_type: report.target_type,
                target_id: report.target_id,
                reported_by: report.reported_by_email,
                report_id: report.id
            })
        });
    } catch (err) {
        console.error("Failed to log audit action", err);
    }

    fetchReports();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-500 hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Moderation Queue</h1>
        </div>
        
        {loading ? (
          <p className="text-slate-500">Loading reports...</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-slate-500 font-medium">All caught up!</p>
            <p className="text-slate-400 text-sm mt-1">No pending reports in the queue.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(r => {
              const t = targets[r.target_id];
              return (
                <div key={r.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2 py-1 rounded">{r.target_type}</span>
                      <p className="text-xs text-slate-500 mt-2">Reported by: {r.reported_by_email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(r, 'dismiss')} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50">Dismiss</button>
                      <button onClick={() => handleAction(r, 'delete')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 shadow-sm">
                        <Trash2 className="w-3.5 h-3.5" /> Delete Content
                      </button>
                    </div>
                  </div>
                  <div className="mb-3 bg-red-50/50 text-red-800 text-sm p-3 rounded-xl border border-red-100">
                    <span className="font-semibold text-red-900">Reason:</span> {r.reason}
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Target Content</p>
                    <p className="text-sm text-slate-700">{t?.title ? `${t.title} - ${t.content || ''}` : t?.content || "N/A"}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}