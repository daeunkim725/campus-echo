import React, { useState } from "react";
import { Calendar, MapPin, Tag, X } from "lucide-react";
import { format } from "date-fns";

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
  const [startDate, setStartDate] = useState(filters.startDate || "");
  const [endDate, setEndDate] = useState(filters.endDate || "");
  const [locationType, setLocationType] = useState(filters.locationType || "all");
  const [selectedCategories, setSelectedCategories] = useState(filters.interests || []);

  const handleApply = () => {
    onFilterChange({
      startDate,
      endDate,
      locationType,
      interests: selectedCategories
    });
    onClose();
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setLocationType("all");
    setSelectedCategories([]);
    onFilterChange({
      startDate: "",
      endDate: "",
      locationType: "all",
      interests: []
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

        <div className="space-y-6 max-h-[60vh] overflow-y-auto mb-6">
          {/* Date Range */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5" style={{ color: schoolConfig?.primary }} />
              <label className="font-semibold text-slate-900">Date Range</label>
            </div>
            <div className="space-y-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": schoolConfig?.primary + "33" }}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": schoolConfig?.primary + "33" }}
              />
            </div>
          </div>

          {/* Location Type */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5" style={{ color: schoolConfig?.primary }} />
              <label className="font-semibold text-slate-900">Location</label>
            </div>
            <div className="flex gap-2">
              {["all", "on-campus", "off-campus"].map((type) => (
                <button
                  key={type}
                  onClick={() => setLocationType(type)}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    locationType === type
                      ? "text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  style={{
                    backgroundColor: locationType === type ? schoolConfig?.primary : undefined
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategories.includes(cat.id)
                      ? "text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  style={{
                    backgroundColor: selectedCategories.includes(cat.id) ? schoolConfig?.primary : undefined
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
            className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 text-slate-900 font-semibold hover:bg-slate-200 transition-all"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2.5 rounded-full text-white font-semibold hover:opacity-90 transition-all"
            style={{ backgroundColor: schoolConfig?.primary }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}