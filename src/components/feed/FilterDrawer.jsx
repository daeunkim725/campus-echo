import React, { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { getSchoolConfig } from "@/components/utils/schoolConfig";
import { useThemeTokens } from "@/components/utils/ThemeProvider";

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
  const tokens = useThemeTokens(schoolConfig);
  const primary = tokens.primary;

  const set = (key, val) => onChange({ ...filters, [key]: val });

  const activeCount = [
    filters.category !== "all",
    filters.department !== "all",
    filters.level !== "all"
  ].filter(Boolean).length;

  return (
    <>
      {/* Trigger Row */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        {/* Sort dropdown */}
        <div className="relative flex-shrink-0">
          <select
            value={filters.sort}
            onChange={e => set("sort", e.target.value)}
            className="appearance-none text-xs font-medium rounded-full px-2.5 py-1 pr-6 focus:outline-none cursor-pointer transition-colors border"
            style={{ backgroundColor: tokens.surface, borderColor: tokens.border, color: tokens.text }}
            onFocus={(e) => e.target.style.borderColor = primary}
            onBlur={(e) => e.target.style.borderColor = tokens.border}
          >
            <option value="new">🕐 New</option>
            <option value="hot">🔥 Hot</option>
            <option value="top">📈 Top</option>
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div className="w-px h-5 flex-shrink-0 mx-1" style={{ backgroundColor: tokens.border }} />

        {/* Category quick pills */}
        <button
          onClick={() => set("category", "all")}
          className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
          style={filters.category === "all"
            ? { backgroundColor: tokens.text, color: tokens.surface }
            : { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, color: tokens.textMuted }}
        >
          ✨ All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => set("category", filters.category === cat ? "all" : cat)}
            className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all capitalize"
            style={filters.category === cat
              ? { backgroundColor: tokens.text, color: tokens.surface }
              : { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, color: tokens.textMuted }}
          >
            {categoryEmojis[cat]} {cat}
          </button>
        ))}

        <div className="w-px h-5 flex-shrink-0 mx-1" style={{ backgroundColor: tokens.border }} />

        {/* Filter button */}
        <button
          onClick={() => setOpen(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border"
          style={activeCount > 0
            ? { backgroundColor: primary, borderColor: primary, color: "#FFFFFF" }
            : { backgroundColor: tokens.surface, borderColor: tokens.border, color: tokens.textMuted }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters {activeCount > 0 && <span className="bg-white/30 text-white text-xs px-1.5 py-0.5 rounded-full">{activeCount}</span>}
        </button>
      </div>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-xl rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: tokens.surfaceElevated }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: tokens.text }}>Filters</h2>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: tokens.divider, color: tokens.textMuted }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Academic Level */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: tokens.textMuted }}>Academic Level</p>
              <div className="flex gap-2 flex-wrap">
                {["all", ...LEVELS].map(l => (
                  <button
                    key={l}
                    onClick={() => set("level", l)}
                    className="px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
                    style={filters.level === l
                      ? { backgroundColor: primary, borderColor: primary, color: "#FFFFFF" }
                      : { backgroundColor: tokens.surface, borderColor: tokens.border, color: tokens.textMuted }}
                  >
                    {l === "all" ? "All Levels" : l}
                  </button>
                ))}
              </div>
            </div>

            {/* Department Filter - only show for ETH users */}
            {userSchool === "ETH" && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: tokens.textMuted }}>ETH Zurich Departments</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => set("department", "all")}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all border"
                    style={filters.department === "all"
                      ? { backgroundColor: primary, borderColor: primary, color: "#FFFFFF" }
                      : { backgroundColor: tokens.surface, borderColor: tokens.border, color: tokens.textMuted }}
                  >
                    All
                  </button>
                  {ETH_DEPTS.map(d => (
                    <button
                      key={d.code}
                      onClick={() => set("department", filters.department === d.code ? "all" : d.code)}
                      className="px-3 py-1 rounded-full text-xs font-medium transition-all border"
                      style={filters.department === d.code
                        ? { backgroundColor: primary, borderColor: primary, color: "#FFFFFF" }
                        : { backgroundColor: tokens.surface, borderColor: tokens.border, color: tokens.textMuted }}
                    >
                      {d.code}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2 border-t" style={{ borderColor: tokens.divider }}>
              <button
                onClick={() => { onChange({ ...filters, department: "all", level: "all" }); setOpen(false); }}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all"
                style={{ borderColor: tokens.border, color: tokens.textMuted, backgroundColor: tokens.surface }}
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