import React, { useState, useEffect } from "react";
import { Plus, ChevronDown, Bell } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import ProfilePanel from "@/components/profile/ProfilePanel";
import { SCHOOL_CONFIG } from "@/components/utils/schoolConfig";
import { getMoodEmoji } from "@/components/utils/moodUtils";
import { useThemeTokens } from "@/components/utils/ThemeProvider";
import { useScrollDirection } from "@/components/utils/useScrollDirection";

export default function SchoolTopBar({ currentUser, onUserUpdate, onPost, activePage = "feed", schoolConfig, schoolCode }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const tokens = useThemeTokens(schoolConfig);
  const primary = tokens.primary;
  const isAdmin = currentUser?.role === "admin";
  const scrollDirection = useScrollDirection();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser?.email) {
      base44.entities.Notification.filter({ user_email: currentUser.email, read: false })
        .then(res => setUnreadCount(res.length))
        .catch(() => {});
    }
  }, [currentUser]);

  const navigateToSchool = (code) => {
    setShowSchoolPicker(false);
    window.location.href = createPageUrl("SchoolFeed") + `?school=${code}`;
  };

  return (
    <>
      <div className={`sticky z-40 bg-white/70 backdrop-blur-md border-b border-slate-100 transition-all duration-300 ${scrollDirection === 'down' ? '-top-20' : 'top-0'}`}>
        <div className="max-w-xl mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Profile avatar & Notifications */}
              <button onClick={() => window.location.href = createPageUrl("Notifications")} className="relative w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{unreadCount}</span>}
              </button>
              <button
                onClick={() => setShowProfile(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: tokens.primaryLight }}
                title="Your profile"
              >
                {getMoodEmoji(currentUser?.mood)}
              </button>

              <div className="flex items-center gap-2">
                {/* School name / switcher for admins */}
                {isAdmin ? (
                  <button
                    onClick={() => setShowSchoolPicker(true)}
                    className="flex items-center gap-1 text-sm font-black text-slate-900 tracking-tight hover:opacity-75 transition-opacity"
                  >
                    {schoolConfig?.name || "fizz"}
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                ) : (
                  <h1 className="text-sm font-black text-slate-900 tracking-tight">{schoolConfig?.name || "fizz"}</h1>
                )}

                {/* Nav tabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg ml-2">
                  <button
                    onClick={() => window.location.href = createPageUrl("SchoolFeed") + `?school=${schoolCode}`}
                    className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${activePage === "feed" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Feed
                  </button>
                  <button
                    onClick={() => window.location.href = createPageUrl("Market") + (schoolCode ? `?school=${schoolCode}` : "")}
                    className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${activePage === "market" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Market
                  </button>
                  <button
                    onClick={() => window.location.href = createPageUrl("Events") + `?school=${schoolCode}`}
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
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full text-white shadow-xl transition-all hover:shadow-2xl hover:scale-105 active:scale-95 opacity-70 hover:opacity-100"
        style={{ backgroundColor: primary }}
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* Admin school picker */}
      {showSchoolPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowSchoolPicker(false)}>
          <div className="bg-white w-full max-w-xl rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Switch School</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SCHOOL_CONFIG).map(([code, cfg]) => (
                <button
                  key={code}
                  onClick={() => navigateToSchool(code)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${schoolCode === code ? "border-current" : "border-slate-100 hover:border-slate-200"}`}
                  style={schoolCode === code ? { borderColor: cfg.primary, backgroundColor: cfg.bg } : {}}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: cfg.primary }}>
                    {code.slice(0, 2)}
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{cfg.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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