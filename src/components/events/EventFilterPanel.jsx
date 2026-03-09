import React, { useState } from "react";
import { MapPin, Tag, X, Calendar as CalendarIcon } from "lucide-react";
import { useThemeTokens } from "@/components/utils/ThemeProvider";

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

export default function EventFilterPanel({ filters, onFilterChange, schoolConfig, onClose }) {
  const [locationType, setLocationType] = useState(filters.locationType || "all");
  const [selectedCategories, setSelectedCategories] = useState(filters.interests || []);
  const [dateRange, setDateRange] = useState(filters.dateRange || "all");
  const tokens = useThemeTokens(schoolConfig);

  const handleApply = () => {
    onFilterChange({
      locationType,
      interests: selectedCategories,
      dateRange
    });
    onClose();
  };

  const handleClearFilters = () => {
    setLocationType("all");
    setSelectedCategories([]);
    setDateRange("all");
    onFilterChange({
      locationType: "all",
      interests: [],
      dateRange: "all"
    });
    onClose();
  };

  const toggleCategory = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId)
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Filter Events</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto mb-6 px-1">
          {/* Date Range */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CalendarIcon className="w-5 h-5" style={{ color: tokens.primary }} />
              <label className="font-semibold text-slate-900">Date Range</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {["all", "today", "this-week", "this-month"].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-2.5 py-1.5 rounded-md font-medium text-xs transition-all ${dateRange === range
                    ? "text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  style={{
                    backgroundColor: dateRange === range ? tokens.primary : undefined
                  }}
                >
                  {range === "all" ? "All Time" : range === "today" ? "Today" : range === "this-week" ? "This Week" : "This Month"}
                </button>
              ))}
            </div>
          </div>

          {/* Location Type */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5" style={{ color: tokens.primary }} />
              <label className="font-semibold text-slate-900">Location</label>
            </div>
            <div className="flex gap-2">
              {["all", "on-campus", "off-campus"].map((type) => (
                <button
                  key={type}
                  onClick={() => setLocationType(type)}
                  className={`px-2.5 py-1.5 rounded-md font-medium text-xs transition-all ${locationType === type
                    ? "text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  style={{
                    backgroundColor: locationType === type ? tokens.primary : undefined
                  }}
                >
                  {type === "all" ? "All" : type === "on-campus" ? "On Campus" : "Off Campus"}
                </button>
              ))}
            </div>
          </div>

          {/* Interest Categories */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5" style={{ color: schoolConfig?.primary }} />
              <label className="font-semibold text-slate-900">Interests</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {INTEREST_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${selectedCategories.includes(cat.id)
                    ? "text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  style={{
                    backgroundColor: selectedCategories.includes(cat.id) ? tokens.primary : undefined
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={handleClearFilters}
            className="flex-1 px-4 py-2 rounded-full bg-slate-100 text-slate-900 text-sm font-semibold hover:bg-slate-200 transition-all"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-all"
            style={{ backgroundColor: tokens.primary }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}