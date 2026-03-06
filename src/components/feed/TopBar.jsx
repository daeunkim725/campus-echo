import React, { useState, useEffect } from "react";
import { Plus, Bell } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import ProfilePanel, { getMoodLabel } from "@/components/profile/ProfilePanel";
import { getMoodEmoji } from "@/components/utils/moodUtils";
import { useThemeTokens } from "@/components/utils/ThemeProvider";
import { useScrollDirection } from "@/components/utils/useScrollDirection";
import { BatSilhouette, RippleButton } from "@/components/ui/BatIcons";

export default function TopBar({ currentUser, onUserUpdate, onPost, postLabel = "Post", activePage = "feed", schoolConfig }) {
  const [showProfile, setShowProfile] = useState(false);
  const tokens = useThemeTokens(schoolConfig);
  const primary = tokens.primary;
  const scrollDirection = useScrollDirection();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser?.email) {
      base44.entities.Notification.filter({ user_email: currentUser.email, read: false })
        .then(res => setUnreadCount(res.length))
        .catch(() => {});
    }
  }, [currentUser]);

  return (
    <>
      <div className={`sticky z-40 bg-white/70 backdrop-blur-md border-b border-slate-100 transition-all duration-300 ${scrollDirection === 'down' ? '-top-20' : 'top-0'}`}>
        <div className="max-w-xl mx-auto px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-3">
              {/* Profile avatar */}
              <button
                onClick={() => setShowProfile(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: tokens.primaryLight }}
                title="Your profile"
              >
                {getMoodEmoji(currentUser?.mood)}
              </button>

              {/* Logo + nav tabs */}
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Echo</h1>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => window.location.href = createPageUrl("Home")}
                    className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${activePage === "feed" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Feed
                  </button>
                  <button
                    onClick={() => window.location.href = createPageUrl("Market")}
                    className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${activePage === "market" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Market
                  </button>
                  <button
                    onClick={() => window.location.href = createPageUrl("Events")}
                    className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${activePage === "events" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Events
                  </button>
                </div>
              </div>
            </div>

          </div>
          
          <div className="mt-1">
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm focus-within:ring-2 focus-within:ring-slate-100 transition-all">
              <BatSilhouette className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Echo for textbooks, apartments, parties..." className="bg-transparent border-none outline-none text-[13px] w-full text-slate-700 placeholder:text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Notification Button */}
      <button
        onClick={() => window.location.href = createPageUrl("Notifications")}
        title="Echo pings"
        className="fixed bottom-24 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white text-slate-600 shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:scale-105 active:scale-95"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>}
      </button>

      {/* Floating Post Button */}
      <RippleButton
        onClick={onPost}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
        style={{ backgroundColor: primary }}
      >
        <Plus className="w-6 h-6" />
      </RippleButton>

      {showProfile && (
        <ProfilePanel
          currentUser={currentUser}
          onClose={() => setShowProfile(false)}
          onUserUpdate={onUserUpdate}
          schoolConfig={schoolConfig}
        />
      )}
    </>
  );
}