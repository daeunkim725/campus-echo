import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getSchoolConfig } from "@/components/utils/schoolConfig";

export default function Layout({ children, currentPageName }) {
  const [config, setConfig] = useState(getSchoolConfig(null));

  useEffect(() => {
    base44.auth.me().then(u => {
      const school = u?.school || (u?.role === 'admin' ? 'ETH' : null);
      setConfig(getSchoolConfig(school));
    }).catch(() => {});
  }, []);

  const d = config.dark;

  return (
    <div className="min-h-screen bg-[#F6F8FC] font-sans" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <style>{`
        :root {
          --theme-bg: ${d.bg};
          --theme-surface: ${d.surface};
          --theme-elevated: ${d.elevated};
          --theme-border: ${d.border};
          --theme-divider: ${d.divider};
          --theme-text: ${d.text};
          --theme-muted: ${d.textMuted};
          --theme-faint: ${d.textFaint};
          --theme-primary: ${d.primary};
          --theme-primary-light: ${d.primaryLight};
        }

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
        html.dark, .dark body { background-color: var(--theme-bg) !important; color: var(--theme-text) !important; }
        
        /* Backgrounds */
        .dark .bg-slate-50, .dark .bg-gray-50 { background-color: var(--theme-elevated) !important; }
        .dark .bg-white, .dark .bg-white\\/90, .dark .bg-white\\/80, .dark .bg-white\\/70 { background-color: var(--theme-surface) !important; border-color: var(--theme-border) !important; }
        .dark .bg-slate-100, .dark .bg-gray-100, .dark .bg-slate-200 { background-color: var(--theme-elevated) !important; border-color: var(--theme-border) !important; }
        
        /* Modals and Overlays */
        .dark .fixed.inset-0.bg-black\\/50, .dark .fixed.inset-0.bg-black\\/40 { background-color: rgba(0,0,0,0.6) !important; }
        
        /* Shadows (remove in dark mode, rely on borders) */
        .dark .shadow-sm, .dark .shadow, .dark .shadow-md, .dark .shadow-lg, .dark .shadow-xl, .dark .shadow-2xl { box-shadow: none !important; }
        
        /* Hover States */
        .dark .hover\\:bg-slate-50:hover, .dark .hover\\:bg-gray-50:hover, .dark .hover\\:bg-white:hover { background-color: var(--theme-elevated) !important; }
        .dark .hover\\:bg-slate-100:hover, .dark .hover\\:bg-gray-100:hover { background-color: var(--theme-border) !important; }

        /* Text Colors */
        .dark .text-slate-900, .dark .text-slate-800, .dark .text-gray-900 { color: var(--theme-text) !important; }
        .dark .text-slate-700, .dark .text-slate-600, .dark .text-gray-700 { color: var(--theme-text) !important; }
        .dark .text-slate-500, .dark .text-gray-500 { color: var(--theme-muted) !important; }
        .dark .text-slate-400, .dark .text-gray-400, .dark .text-slate-300 { color: var(--theme-faint) !important; }

        /* Borders & Dividers */
        .dark .border-slate-100, .dark .border-gray-100, .dark .border-slate-50 { border-color: var(--theme-border) !important; }
        .dark .border-slate-200, .dark .border-gray-200, .dark .border-slate-300 { border-color: var(--theme-divider) !important; }
        .dark .divide-slate-100 > :not([hidden]) ~ :not([hidden]), .dark .divide-slate-200 > :not([hidden]) ~ :not([hidden]) { border-color: var(--theme-divider) !important; }

        /* Interactive Elements */
        .dark .bg-red-50 { background-color: rgba(255,92,92,0.1) !important; color: #FF5C5C !important; }
        .dark .text-red-500, .dark .hover\\:text-red-500:hover { color: #FF5C5C !important; }
        
        .dark .bg-indigo-50, .dark .bg-blue-50 { background-color: var(--theme-primary-light) !important; color: var(--theme-primary) !important; }
        .dark .text-indigo-600, .dark .text-blue-600, .dark .hover\\:text-blue-600:hover { color: var(--theme-primary) !important; }
        
        /* Category Chips in dark mode */
        .dark .bg-pink-50 { background-color: rgba(236,72,153,0.1) !important; color: #EC4899 !important; }
        .dark .text-pink-600 { color: #EC4899 !important; }
        .dark .bg-amber-50 { background-color: rgba(245,158,11,0.1) !important; color: #F59E0B !important; }
        .dark .text-amber-600 { color: #F59E0B !important; }
        .dark .bg-orange-50 { background-color: rgba(249,115,22,0.1) !important; color: #F97316 !important; }
        .dark .text-orange-600 { color: #F97316 !important; }
        .dark .bg-purple-50 { background-color: rgba(168,85,247,0.1) !important; color: #A855F7 !important; }
        .dark .text-purple-600 { color: #A855F7 !important; }
        .dark .bg-teal-50 { background-color: rgba(20,184,166,0.1) !important; color: #14B8A6 !important; }
        .dark .text-teal-600 { color: #14B8A6 !important; }
        
        /* Form elements */
        .dark input, .dark textarea, .dark select { background-color: var(--theme-elevated) !important; color: var(--theme-text) !important; border-color: var(--theme-border) !important; }
        .dark input::placeholder, .dark textarea::placeholder { color: var(--theme-faint) !important; }
        
        /* Overriding hardcoded primary colors in dark mode components */
        .dark [style*="backgroundColor: #7C3AED"], .dark [style*="backgroundColor: rgb(124, 58, 237)"] { background-color: var(--theme-primary) !important; color: var(--theme-bg) !important; }
        .dark [style*="color: #7C3AED"], .dark [style*="color: rgb(124, 58, 237)"] { color: var(--theme-primary) !important; }
        
        /* Polls */
        .dark .bg-indigo-100, .dark .bg-blue-100 { background-color: var(--theme-primary-light) !important; }
      `}</style>
      <div className="dark:bg-[var(--theme-bg)] dark:text-[var(--theme-text)] min-h-screen">
        {children}
      </div>
    </div>
  );
}