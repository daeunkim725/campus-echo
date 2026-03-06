import React from "react";
import { getSchoolConfig } from "@/components/utils/schoolConfig";

const CATEGORIES = ["general", "academics", "housing", "food", "rants", "confessions", "advice"];

const ETH_DEPTS = [
  { code: "D-ARCH", name: "Architecture" },
  { code: "D-BAUG", name: "Civil Engineering" },
  { code: "D-BSSE", name: "Biosystems" },
  { code: "D-INFK", name: "Computer Science" },
  { code: "D-ITET", name: "Electrical Eng." },
  { code: "D-MATL", name: "Materials" },
  { code: "D-MATH", name: "Mathematics" },
  { code: "D-MAVT", name: "Mech. Eng." },
  { code: "D-MTEC", name: "Management" },
  { code: "D-PHYS", name: "Physics" },
  { code: "D-USYS", name: "Env. Systems" },
  { code: "D-ERDW", name: "Earth Sciences" },
  { code: "D-BIOL", name: "Biology" },
  { code: "D-CHAB", name: "Chemistry" },
  { code: "D-GESS", name: "Humanities" },
  { code: "D-HEST", name: "Health Sci." },
];

const OTHER_UNIS = [
  { code: "EPFL", name: "EPFL" },
  { code: "UNIZH", name: "Uni Zürich" },
  { code: "UNIBASEL", name: "Uni Basel" },
  { code: "UNIBE", name: "Uni Bern" },
  { code: "UNIL", name: "Uni Lausanne" },
  { code: "UNIFR", name: "Uni Fribourg" },
  { code: "UNIGE", name: "Uni Genève" },
  { code: "UNISG", name: "Uni St. Gallen" },
  { code: "USI", name: "USI Lugano" },
  { code: "UNILU", name: "Uni Lucerne" },
];

const LEVELS = ["BSc", "MSc", "PhD"];

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
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filters.category === "all"
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-500 hover:text-slate-700"
            }`}
          >
            ✨ All
          </button>
          
          <div className="w-px h-4 bg-slate-300 flex-shrink-0 mx-1" />
          
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={(e) => {
                set("category", filters.category === cat ? "all" : cat);
                e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                filters.category === cat
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-500 hover:text-slate-700"
              }`}
            >
              {categoryEmojis[cat]} {cat}
            </button>
          ))}
        </div>

      </div>
    </>
  );
}