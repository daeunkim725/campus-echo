import React from "react";

const categories = ["all", "general", "academics", "social", "housing", "food", "sports", "rants", "confessions", "advice", "events"];

const categoryEmojis = {
  all: "✨",
  general: "💬",
  academics: "📚",
  social: "🎉",
  housing: "🏠",
  food: "🍕",
  sports: "⚽",
  rants: "😤",
  confessions: "🤫",
  advice: "💡",
  events: "📅"
};

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={(e) => {
            onSelect(cat);
            e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
          }}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            selected === cat
              ? "bg-violet-600 text-white shadow-sm"
              : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700"
          }`}
        >
          <span>{categoryEmojis[cat]}</span>
          <span className="capitalize">{cat}</span>
        </button>
      ))}
    </div>
  );
}