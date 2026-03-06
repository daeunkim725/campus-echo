import React, { useState } from "react";
import { X, Flag } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ReportModal({ targetType, targetId, currentUser, onClose }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    await base44.entities.Report.create({
      target_type: targetType,
      target_id: targetId,
      reason: reason.trim(),
      status: "pending",
      reported_by_email: currentUser?.email || "anonymous"
    });
    setLoading(false);
    setSubmitted(true);
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" /> Report {targetType}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        {submitted ? (
          <p className="text-sm text-green-600 font-medium text-center py-4">Report submitted successfully. Thank you.</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 mb-3">Please describe why you are reporting this content.</p>
            <textarea
              autoFocus
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-red-400 mb-4 resize-none h-24"
              placeholder="Reason for report..."
            />
            <button
              onClick={handleSubmit}
              disabled={!reason.trim() || loading}
              className="w-full py-2.5 rounded-xl bg-red-500 text-white font-semibold disabled:opacity-50 hover:bg-red-600 transition-colors"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}