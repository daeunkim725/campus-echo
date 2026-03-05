import React, { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const schoolConfig = getSchoolConfig(userSchool);
  const primary = schoolConfig?.primary || "#7C3AED";

  const set = (key, val) => onChange({ ...filters, [key]: val });

  const activeCount = [
    filters.category !== "all",
    filters.department !== "all",
    filters.level !== "all"
  ].filter(Boolean).length;

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
            onClick={() => set("category", "all")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filters.category === "all"
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-500 hover:text-slate-700"
            }`}
          >
            ✨ All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => set("category", filters.category === cat ? "all" : cat)}
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

        <div className="w-px h-5 bg-slate-200 flex-shrink-0" />

        {/* Filter button - Static */}
        <button
          onClick={() => setOpen(true)}
          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
            activeCount > 0
              ? "text-white"
              : "bg-white border-slate-200 text-slate-500 hover:text-slate-700"
          }`}
          style={activeCount > 0 ? { backgroundColor: primary, borderColor: primary } : {}}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeCount > 0 && <span className="bg-white/30 text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeCount}</span>}
        </button>
      </div>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="bg-white w-full max-w-xl rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Filters</h2>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Academic Level */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Academic Level</p>
              <div className="flex gap-2 flex-wrap">
                {["all", ...LEVELS].map(l => (
                  <button
                    key={l}
                    onClick={() => set("level", l)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                      filters.level === l
                        ? "text-white"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                    style={filters.level === l ? { backgroundColor: primary, borderColor: primary } : {}}
                  >
                    {l === "all" ? "All Levels" : l}
                  </button>
                ))}
              </div>
            </div>

            {/* Department Filter - only show for ETH users */}
            {userSchool === "ETH" && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">ETH Zurich Departments</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => set("department", "all")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                      filters.department === "all"
                        ? "text-white"
                        : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                    style={filters.department === "all" ? { backgroundColor: primary, borderColor: primary } : {}}
                  >
                    All
                  </button>
                  {ETH_DEPTS.map(d => (
                    <button
                      key={d.code}
                      onClick={() => set("department", filters.department === d.code ? "all" : d.code)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                        filters.department === d.code
                          ? "text-white"
                          : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                      }`}
                      style={filters.department === d.code ? { backgroundColor: primary, borderColor: primary } : {}}
                    >
                      {d.code}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => { onChange({ ...filters, department: "all", level: "all" }); setOpen(false); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ backgroundColor: primary }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}