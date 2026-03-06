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

export default function CategoryFilter({ selected, onSelect, tokens }) {
  const primary = tokens?.primary || "#7C3AED";
  const primaryLight = tokens?.primaryLight || "#EDE9FE";

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border"
          style={selected === cat
            ? { backgroundColor: primary, borderColor: primary, color: "#FFFFFF" }
            : { backgroundColor: tokens?.surface || "#FFFFFF", borderColor: tokens?.border || "#E2E8F0", color: tokens?.textMuted || "#64748B" }}
        >
          <span>{categoryEmojis[cat]}</span>
          <span className="capitalize">{cat}</span>
        </button>
      ))}
    </div>
  );
}