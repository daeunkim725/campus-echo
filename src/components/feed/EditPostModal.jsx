import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CATEGORIES = ["general", "academics", "housing", "food", "rants", "confessions", "advice", "events"];

export default function EditPostModal({ post, onClose, onSaved, primaryColor = "#7C3AED" }) {
  const isEvent = post.category === "events";
  
  const [title, setTitle] = useState(post.title || "");
  const [content, setContent] = useState(post.content || "");
  const [category, setCategory] = useState(post.category || "general");
  const [loading, setLoading] = useState(false);
  
  // Event specific fields
  const [eventDate, setEventDate] = useState(post.event_date || "");
  const [eventTime, setEventTime] = useState(post.event_time || "");
  const [eventLocation, setEventLocation] = useState(post.event_location || "");
  const [eventType, setEventType] = useState(post.event_type || "on-campus");
  const [eventInterests, setEventInterests] = useState(post.event_interests || []);

  const INTEREST_CATEGORIES = [
    { id: "social", label: "Social" },
    { id: "sports", label: "Sports" },
    { id: "academic", label: "Academic" },
    { id: "cultural", label: "Cultural" },
    { id: "professional", label: "Professional" },
    { id: "wellness", label: "Wellness" },
    { id: "arts", label: "Arts" },
    { id: "tech", label: "Tech" },
    { id: "other", label: "Other" }
  ];

  const toggleInterest = (catId) => {
    setEventInterests((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  let isValid = title.trim().length > 0;
  if (isEvent) {
    isValid = isValid && !!eventDate && !!eventTime && eventLocation.trim().length > 0;
  }

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    
    const updateData = {
      title: title.trim(),
      content: content.trim() || null,
      category,
      edited: true,
    };

    if (isEvent) {
      updateData.event_date = eventDate;
      updateData.event_time = eventTime;
      updateData.event_location = eventLocation.trim();
      updateData.event_type = eventType;
      updateData.event_interests = eventInterests;
    }

    await base44.entities.Post.update(post.id, updateData);
    setLoading(false);
    onSaved?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{isEvent ? "Edit Event" : "Edit Post"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {isEvent && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date <span className="text-red-400">*</span></p>
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 text-[15px] focus:outline-none transition-all" style={{ outline: eventDate ? "none" : undefined }} onFocus={(e) => e.target.style.borderColor = primaryColor} onBlur={(e) => e.target.style.borderColor = ""} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Time <span className="text-red-400">*</span></p>
                <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 text-[15px] focus:outline-none transition-all" style={{ outline: eventTime ? "none" : undefined }} onFocus={(e) => e.target.style.borderColor = primaryColor} onBlur={(e) => e.target.style.borderColor = ""} />
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location <span className="text-red-400">*</span></p>
                <input type="text" placeholder="Where is it happening?" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-800 text-[15px] focus:outline-none transition-all" style={{ outline: eventLocation ? "none" : undefined }} onFocus={(e) => e.target.style.borderColor = primaryColor} onBlur={(e) => e.target.style.borderColor = ""} />
                </div>
              <div className="col-span-2">
                <div className="flex gap-2">
                  <button onClick={() => setEventType("on-campus")} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${eventType === "on-campus" ? "text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`} style={{ backgroundColor: eventType === "on-campus" ? primaryColor : undefined }}>On Campus</button>
                  <button onClick={() => setEventType("off-campus")} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${eventType === "off-campus" ? "text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`} style={{ backgroundColor: eventType === "off-campus" ? primaryColor : undefined }}>Off Campus</button>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_CATEGORIES.map((cat) =>
                    <button key={cat.id} onClick={() => toggleInterest(cat.id)} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${eventInterests.includes(cat.id) ? "text-white border-transparent" : "border-slate-200 text-slate-600 hover:border-slate-300"}`} style={{ backgroundColor: eventInterests.includes(cat.id) ? primaryColor : undefined }}>{cat.label}</button>
                  )}
                </div>
              </div>
            </div>
          )}
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

          {!isEvent && (
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
          )}

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

        <div className="flex items-center justify-end gap-2 px-6 pb-5 pt-3 border-t border-slate-100 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all shadow-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}