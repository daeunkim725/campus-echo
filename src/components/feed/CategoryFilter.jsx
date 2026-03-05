import React from "react";

const categories = ["all", "general", "academics", "social", "housing", "food", "sports", "rants", "confessions", "advice", "events"];

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="flex gap-0 overflow-x-auto scrollbar-hide border-b border-gray-100">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`flex-shrink-0 px-4 py-2.5 text-[13px] font-medium transition-all whitespace-nowrap relative ${
            selected === cat
              ? "text-[#E8344E]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {cat === "all" ? "All" : `#${cat}`}
          {selected === cat && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E8344E]" />
          )}
        </button>
      ))}
    </div>
  );
}