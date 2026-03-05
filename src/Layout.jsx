import React, { useState, useEffect } from "react";
import { getSchoolConfig } from "@/components/utils/schoolConfig";

export default function Layout({ children, currentPageName }) {
  const [isDark, setIsDark] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    
    const checkDarkMode = () => setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { base44 } = await import("@/api/base44Client");
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (e) {}
    };
    fetchUser();
  }, []);

  const schoolConfig = getSchoolConfig(currentUser?.school);
  const bgColor = isDark ? schoolConfig?.darkBg || "#0F1419" : "rgb(248, 250, 252)";
  const textColor = isDark ? schoolConfig?.darkText || "#E8EAED" : "rgb(15, 23, 42)";

  return (
    <div className="min-h-screen font-sans transition-colors duration-300" style={{ backgroundColor: bgColor, color: textColor }}>
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

        ${isDark ? `
          :root {
            --background: ${schoolConfig?.darkBg || '#0F1419'};
            --foreground: ${schoolConfig?.darkText || '#E8EAED'};
            --card: ${schoolConfig?.darkCard || '#1A1F2E'};
            --card-foreground: ${schoolConfig?.darkText || '#E8EAED'};
            --muted: #4B5563;
            --muted-foreground: #AAAFBE;
          }
          body { background-color: ${schoolConfig?.darkBg || '#0F1419'} !important; color: ${schoolConfig?.darkText || '#E8EAED'} !important; }
          .bg-white { background-color: ${schoolConfig?.darkCard || '#1A1F2E'} !important; }
          .bg-slate-50 { background-color: ${schoolConfig?.darkBg || '#0F1419'} !important; }
          .bg-slate-100 { background-color: ${schoolConfig?.darkCard || '#1A1F2E'} !important; }
          .text-slate-900 { color: ${schoolConfig?.darkText || '#E8EAED'} !important; }
          .text-slate-800 { color: ${schoolConfig?.darkText || '#E8EAED'} !important; }
          .text-slate-700 { color: ${schoolConfig?.darkText || '#E8EAED'} !important; }
          .text-slate-600 { color: #AAAFBE !important; }
          .text-slate-500 { color: #8B91A1 !important; }
          .text-slate-400 { color: #6F7785 !important; }
          .border-slate-100 { border-color: ${schoolConfig?.darkCard || '#1A1F2E'} !important; }
          .border-slate-200 { border-color: #2A3139 !important; }
          .hover\\:bg-slate-50:hover { background-color: ${schoolConfig?.darkCard || '#1A1F2E'} !important; }
          .hover\\:bg-slate-100:hover { background-color: #2A3139 !important; }
          input, textarea { background-color: ${schoolConfig?.darkCard || '#1A1F2E'} !important; color: ${schoolConfig?.darkText || '#E8EAED'} !important; border-color: #2A3139 !important; }
          input::placeholder, textarea::placeholder { color: #8B91A1 !important; }
        ` : ''}
      `}</style>
      {children}
    </div>
  );
}