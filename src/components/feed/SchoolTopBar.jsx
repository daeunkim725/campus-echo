import React, { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { createPageUrl } from "@/utils";
import ProfilePanel from "@/components/profile/ProfilePanel";
import { SCHOOL_CONFIG } from "@/components/utils/schoolConfig";
import { getMoodEmoji } from "@/components/utils/moodUtils";

export default function SchoolTopBar({ currentUser, onUserUpdate, onPost, activePage = "feed", schoolConfig, schoolCode }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const primary = schoolConfig?.primary || "#7C3AED";
  const isAdmin = currentUser?.role === "admin";

  const navigateToSchool = (code) => {
    setShowSchoolPicker(false);
    window.location.href = createPageUrl("SchoolFeed") + `?school=${code}`;
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-xl mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Profile avatar with mood emoji */}
              <button
                onClick={() => setShowProfile(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: schoolConfig?.primaryLight || "#EDE9FE" }}
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
                <div className="flex bg-slate-100 p-1 rounded-lg">
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
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-[60px] h-[60px] rounded-full text-white shadow-xl transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
        style={{ backgroundColor: primary }}
      >
        <Plus className="w-8 h-8" />
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