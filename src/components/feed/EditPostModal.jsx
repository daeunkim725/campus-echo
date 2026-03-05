import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CATEGORIES = ["general", "academics", "housing", "food", "rants", "confessions", "advice", "events"];

export default function EditPostModal({ post, onClose, onSaved, primaryColor = "#7C3AED" }) {
  const [title, setTitle] = useState(post.title || "");
  const [content, setContent] = useState(post.content || "");
  const [category, setCategory] = useState(post.category || "general");
  const [loading, setLoading] = useState(false);

  const isValid = title.trim().length > 0;

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    await base44.entities.Post.update(post.id, {
      title: title.trim(),
      content: content.trim() || null,
      category,
      edited: true,
    });
    setLoading(false);
    onSaved?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Edit Post</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject <span className="text-red-400">*</span></p>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 text-[15px] focus:outline-none transition-all"
              style={{ borderColor: title.trim() ? primaryColor : undefined }}
              onFocus={(e) => e.target.style.borderColor = primaryColor}
              onBlur={(e) => e.target.style.borderColor = title.trim() ? primaryColor : ""}
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize border ${
                    category === cat ? "text-white border-transparent" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                  style={category === cat ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Content <span className="normal-case font-normal text-slate-400">(optional)</span></p>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-2xl border border-slate-200 p-4 text-slate-800 placeholder:text-slate-400 text-[15px] focus:outline-none transition-all"
              onFocus={(e) => e.target.style.borderColor = primaryColor}
              onBlur={(e) => e.target.style.borderColor = ""}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold disabled:opacity-40 transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}