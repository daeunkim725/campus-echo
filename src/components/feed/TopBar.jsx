import React, { useState } from "react";
import { Plus } from "lucide-react";
import { createPageUrl } from "@/utils";
import ProfilePanel, { getMoodLabel } from "@/components/profile/ProfilePanel";
import { getMoodEmoji } from "@/components/utils/moodUtils";

export default function TopBar({ currentUser, onUserUpdate, onPost, postLabel = "Post", activePage = "feed", schoolConfig }) {
  const [showProfile, setShowProfile] = useState(false);
  const primary = schoolConfig?.primary || "#7C3AED";

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
                style={{ backgroundColor: schoolConfig?.primaryLight || "#EDE9FE" }}
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
                </div>
              </div>
            </div>

            <button
              onClick={onPost}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
              style={{ backgroundColor: primary }}
            >
              <Plus className="w-4 h-4" />
              {postLabel}
            </button>
          </div>
        </div>
      </div>

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