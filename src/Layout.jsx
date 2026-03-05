import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, MessageSquare, Bell, User, PenSquare } from "lucide-react";

const navItems = [
  { label: "Home", page: "Home", icon: Home },
  { label: "Board", page: "Home", icon: MessageSquare },
  { label: "Notifications", page: "Home", icon: Bell },
  { label: "My Page", page: "Home", icon: User },
];

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">
      <style>{`
        * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Top Header */}
      <header className="bg-white border-b border-[#e0e0e0] sticky top-0 z-50">
        <div className="max-w-[980px] mx-auto px-4 h-[52px] flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-[#E4332D] rounded-sm flex items-center justify-center">
              <span className="text-white font-black text-sm">F</span>
            </div>
            <span className="text-[#E4332D] font-black text-[18px] tracking-tight">fizz</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6">
            {navItems.map(item => (
              <Link
                key={item.label}
                to={createPageUrl(item.page)}
                className="text-[13px] text-[#555] hover:text-[#E4332D] transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {/* Mobile nav */}
          <div className="sm:hidden flex items-center gap-4 text-[#555]">
            <Bell className="w-5 h-5" />
            <User className="w-5 h-5" />
          </div>
        </div>
      </header>

      <main className="max-w-[980px] mx-auto">
        {children}
      </main>

      {/* Mobile bottom bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0e0e0] z-50">
        <div className="flex">
          {navItems.map(({ label, page, icon: Icon }) => (
            <Link
              key={label}
              to={createPageUrl(page)}
              className="flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[#999] hover:text-[#E4332D] transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}