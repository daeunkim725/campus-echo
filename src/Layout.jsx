import React from "react";

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#0B0F14] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes slide-in-from-bottom {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-in.slide-in-from-bottom { animation: slide-in-from-bottom 0.3s ease-out; }

        /* --- TRUE NEUTRAL DARK MODE OVERRIDES --- */
        html.dark, .dark body { background-color: #0B0F14 !important; color: #EAF0F7 !important; }
        
        /* Backgrounds */
        .dark .bg-slate-50, .dark .bg-gray-50 { background-color: #18212D !important; }
        .dark .bg-white, .dark .bg-white\\/90, .dark .bg-white\\/80, .dark .bg-white\\/70 { background-color: #121922 !important; border-color: #223041 !important; }
        .dark .bg-slate-100, .dark .bg-gray-100, .dark .bg-slate-200 { background-color: #1C2633 !important; border-color: #223041 !important; }
        
        /* Hover States */
        .dark .hover\\:bg-slate-50:hover, .dark .hover\\:bg-gray-50:hover, .dark .hover\\:bg-white:hover { background-color: #18212D !important; }
        .dark .hover\\:bg-slate-100:hover, .dark .hover\\:bg-gray-100:hover { background-color: #223041 !important; }

        /* Text Colors */
        .dark .text-slate-900, .dark .text-slate-800, .dark .text-gray-900 { color: #EAF0F7 !important; }
        .dark .text-slate-700, .dark .text-slate-600, .dark .text-gray-700 { color: #EAF0F7 !important; }
        .dark .text-slate-500, .dark .text-gray-500 { color: #A8B3C2 !important; }
        .dark .text-slate-400, .dark .text-gray-400, .dark .text-slate-300 { color: #6F7C8F !important; }

        /* Borders & Dividers */
        .dark .border-slate-100, .dark .border-gray-100, .dark .border-slate-50 { border-color: #223041 !important; }
        .dark .border-slate-200, .dark .border-gray-200, .dark .border-slate-300 { border-color: #1C2633 !important; }
        .dark .divide-slate-100 > :not([hidden]) ~ :not([hidden]), .dark .divide-slate-200 > :not([hidden]) ~ :not([hidden]) { border-color: #1C2633 !important; }

        /* Specific Overrides for Profile & UI Elements */
        .dark .bg-red-50 { background-color: rgba(255,92,92,0.1) !important; color: #FF5C5C !important; }
        .dark .text-red-500, .dark .hover\\:text-red-500:hover { color: #FF5C5C !important; }
        
        .dark .bg-indigo-50, .dark .bg-blue-50 { background-color: rgba(110,168,255,0.14) !important; color: #6EA8FF !important; }
        .dark .text-indigo-600, .dark .text-blue-600, .dark .hover\\:text-blue-600:hover { color: #6EA8FF !important; }
        
        /* Ensure inputs and textareas look correct */
        .dark input, .dark textarea, .dark select { background-color: #18212D !important; color: #EAF0F7 !important; border-color: #223041 !important; }
        .dark input::placeholder, .dark textarea::placeholder { color: #6F7C8F !important; }
        
        /* Overriding hardcoded primary colors in dark mode components */
        .dark [style*="backgroundColor: #7C3AED"], .dark [style*="backgroundColor: rgb(124, 58, 237)"] { background-color: #6EA8FF !important; color: #121922 !important; }
        .dark [style*="color: #7C3AED"], .dark [style*="color: rgb(124, 58, 237)"] { color: #6EA8FF !important; }
      `}</style>
      <div className="dark:bg-[#0B0F14] dark:text-[#EAF0F7] min-h-screen">
        {children}
      </div>
    </div>
  );
}