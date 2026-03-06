import React from "react";
import { getSchoolConfig } from "@/components/utils/schoolConfig";
import { BatSilhouette } from "@/components/ui/BatIcons";

const CATEGORIES = ["general", "academics", "housing", "food", "rants", "confessions", "advice"];



const categoryEmojis = {
  general: "💬", academics: "📚", housing: "🏠", food: "🍕",
  rants: "😤", confessions: "🤫", advice: "💡", events: "📅"
};

export default function FilterDrawer({ filters, onChange, userSchool }) {
  const schoolConfig = getSchoolConfig(userSchool);
  const primary = schoolConfig?.primary || "#7C3AED";

  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <>
      {/* Trigger Row */}
      <div className="flex items-center w-full gap-2">
        {/* Sort dropdown - Static */}
        <div className="relative flex-shrink-0">
          <select
            value={filters.sort}
            onChange={e => set("sort", e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-full px-2.5 py-1.5 pr-6 focus:outline-none cursor-pointer focus:bg-white active:bg-white transition-colors"
            style={{ backgroundColor: 'white' }}
            onFocus={(e) => e.target.style.borderColor = primary}
            onBlur={(e) => e.target.style.borderColor = ""}
          >
            <option value="new">🕐 New</option>
            <option value="hot">🔥 Hot</option>
            <option value="top">📈 Top</option>
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div className="w-px h-5 bg-slate-200 flex-shrink-0" />

        {/* Scrollable Category quick pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1 py-0.5">
          <button
            onClick={(e) => {
              onChange({ ...filters, category: "all" });
              e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${
              filters.category === "all"
                ? "bg-white text-slate-800 shadow-sm"
                : "bg-white border-slate-200 text-slate-500 hover:text-slate-700"
            }`}
            style={filters.category === "all" ? { borderColor: primary } : {}}
          >
            {filters.category === "all" ? <BatSilhouette className="w-2.5 h-2.5" color={primary} /> : "✨"} All
          </button>
          
          <div className="w-px h-4 bg-slate-200 flex-shrink-0 mx-1" />
          
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={(e) => {
                set("category", filters.category === cat ? "all" : cat);
                e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize flex items-center gap-1.5 border ${
                filters.category === cat
                  ? "bg-white text-slate-800 shadow-sm"
                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-700"
              }`}
              style={filters.category === cat ? { borderColor: primary } : {}}
            >
              {filters.category === cat ? <BatSilhouette className="w-2.5 h-2.5" color={primary} /> : <span>{categoryEmojis[cat]}</span>} {cat}
            </button>
          ))}
        </div>

      </div>
    </>
  );
}