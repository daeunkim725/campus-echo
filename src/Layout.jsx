import React, { useEffect, useState } from "react";

export default function Layout({ children, currentPageName }) {
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState({});

  useEffect(() => {
    const darkModeListener = (e) => {
      setIsDark(e.detail.isDark);
      setTheme(e.detail.theme || {});
    };
    window.addEventListener("themeChange", darkModeListener);
    return () => window.removeEventListener("themeChange", darkModeListener);
  }, []);

  const bgColor = theme.background || (isDark ? "#0F172A" : "#F6F8FC");
  const textColor = theme.text || (isDark ? "#E6EDF7" : "#0F172A");

  return (
    <div
      className="min-h-screen font-sans transition-colors duration-200"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
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
      `}</style>
      {children}
    </div>
  );
}