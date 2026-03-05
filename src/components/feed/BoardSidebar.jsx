import React from "react";
import { ChevronRight } from "lucide-react";

const boards = [
  { key: "all", label: "All Posts" },
  { key: "general", label: "Free Board" },
  { key: "academics", label: "Academics" },
  { key: "social", label: "Social" },
  { key: "housing", label: "Housing" },
  { key: "food", label: "Dining Hall" },
  { key: "sports", label: "Sports" },
  { key: "rants", label: "Rants" },
  { key: "confessions", label: "Confessions" },
  { key: "advice", label: "Advice" },
  { key: "events", label: "Events" },
];

export default function BoardSidebar({ selected, onSelect }) {
  return (
    <aside className="w-[180px] flex-shrink-0">
      <div className="bg-white border border-[#e0e0e0]">
        <div className="px-4 py-3 border-b border-[#e0e0e0]">
          <h2 className="text-[13px] font-bold text-[#222]">Community</h2>
        </div>
        <ul>
          {boards.map(board => (
            <li key={board.key}>
              <button
                onClick={() => onSelect(board.key)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors text-left border-b border-[#f0f0f0] last:border-b-0 ${
                  selected === board.key
                    ? "bg-[#fff5f5] text-[#E4332D] font-semibold"
                    : "text-[#444] hover:bg-[#f9f9f9]"
                }`}
              >
                {board.label}
                {selected === board.key && <ChevronRight className="w-3.5 h-3.5 text-[#E4332D]" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}