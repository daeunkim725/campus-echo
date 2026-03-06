import React from "react";
import { Toaster } from "sonner";

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
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
      <Toaster position="top-center" expand={true} richColors toastOptions={{
        classNames: {
          toast: 'rounded-xl shadow-lg border border-slate-100 flex items-center gap-3',
          success: 'bg-white text-slate-800 font-medium',
          icon: 'text-indigo-500' // Using indigo for radar/echo theme
        }
      }} />
      {children}
    </div>
  );
}