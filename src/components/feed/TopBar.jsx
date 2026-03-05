import React, { useState } from "react";
import { Plus } from "lucide-react";
import { createPageUrl } from "@/utils";
import ProfilePanel, { getMoodLabel } from "@/components/profile/ProfilePanel";
import { getMoodEmoji } from "@/components/utils/moodUtils";
import { useThemeTokens } from "@/components/utils/ThemeProvider";

export default function TopBar({ currentUser, onUserUpdate, onPost, postLabel = "Post", activePage = "feed", schoolConfig }) {
  const [showProfile, setShowProfile] = useState(false);
  const tokens = useThemeTokens(schoolConfig);
  const primary = tokens.primary;

  return (
    <>
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-xl mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between mb-3">
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
                <h1 className="text-xl font-black text-slate-900 tracking-tight">fizz</h1>
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
        </div>
      </div>

      {/* Floating Post Button */}
      <button
        onClick={onPost}
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-[60px] h-[60px] rounded-full text-white shadow-xl transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
        style={{ backgroundColor: primary }}
      >
        <Plus className="w-8 h-8" />
      </button>

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