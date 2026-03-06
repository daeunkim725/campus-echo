import React, { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { createPageUrl } from "@/utils";
import ProfilePanel from "@/components/profile/ProfilePanel";
import { SCHOOL_CONFIG } from "@/components/utils/schoolConfig";
import { getMoodEmoji } from "@/components/utils/moodUtils";
import { useThemeTokens } from "@/components/utils/ThemeProvider";

export default function SchoolTopBar({ currentUser, onUserUpdate, onPost, activePage = "feed", schoolConfig, schoolCode }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const tokens = useThemeTokens(schoolConfig);
  const primary = tokens.primary;
  const isAdmin = currentUser?.role === "admin";

  const navigateToSchool = (code) => {
    setShowSchoolPicker(false);
    window.location.href = createPageUrl("SchoolFeed") + `?school=${code}`;
  };

  return (
    <>
      <div className="sticky top-0 z-40 backdrop-blur-md border-b"
        style={{ backgroundColor: tokens.surface + "E6", borderColor: tokens.border }}>
        <div className="max-w-xl mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Profile avatar with mood emoji */}
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
                    className="flex items-center gap-1 text-sm font-black tracking-tight hover:opacity-75 transition-opacity"
                    style={{ color: tokens.text }}
                  >
                    {schoolConfig?.name || "fizz"}
                    <ChevronDown className="w-4 h-4" style={{ color: tokens.textMuted }} />
                  </button>
                ) : (
                  <h1 className="text-sm font-black tracking-tight" style={{ color: tokens.text }}>{schoolConfig?.name || "fizz"}</h1>
                )}

                {/* Nav tabs */}
                <div className="flex p-1 rounded-lg ml-2" style={{ backgroundColor: tokens.divider }}>
                  <button
                    onClick={() => window.location.href = createPageUrl("SchoolFeed") + `?school=${schoolCode}`}
                    className="px-2 py-0.5 text-xs font-medium rounded-md transition-colors"
                    style={activePage === "feed"
                      ? { backgroundColor: tokens.surface, color: tokens.text, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }
                      : { color: tokens.textMuted }}
                  >
                    Feed
                  </button>
                  <button
                    onClick={() => window.location.href = createPageUrl("Market") + (schoolCode ? `?school=${schoolCode}` : "")}
                    className="px-2 py-0.5 text-xs font-medium rounded-md transition-colors"
                    style={activePage === "market"
                      ? { backgroundColor: tokens.surface, color: tokens.text, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }
                      : { color: tokens.textMuted }}
                  >
                    Market
                  </button>
                  <button
                    onClick={() => window.location.href = createPageUrl("Events") + `?school=${schoolCode}`}
                    className="px-2 py-0.5 text-xs font-medium rounded-md transition-colors"
                    style={activePage === "events"
                      ? { backgroundColor: tokens.surface, color: tokens.text, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }
                      : { color: tokens.textMuted }}
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
          <div className="w-full max-w-xl rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
            style={{ backgroundColor: tokens.surfaceElevated }}
            onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4" style={{ color: tokens.text }}>Switch School</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SCHOOL_CONFIG).map(([code, cfg]) => (
                <button
                  key={code}
                  onClick={() => navigateToSchool(code)}
                  className="flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left"
                  style={schoolCode === code
                    ? { borderColor: cfg.light.primary, backgroundColor: tokens.primaryLight }
                    : { borderColor: tokens.border, backgroundColor: tokens.surface }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: cfg.light.primary }}>
                    {code.slice(0, 2)}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: tokens.text }}>{cfg.name}</span>
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