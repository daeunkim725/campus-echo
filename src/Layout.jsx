import React from "react";

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-[#f8f8f8] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .post-row:not(:last-child) {
          border-bottom: 1px solid #f0f0f0;
        }
      `}</style>
      {children}
    </div>
  );
}