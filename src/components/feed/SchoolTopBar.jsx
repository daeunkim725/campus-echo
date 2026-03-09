import React, { useState, useEffect } from "react";
import { Plus, ChevronDown, Bell, MessageCircle } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import ProfilePanel from "@/components/profile/ProfilePanel";
import { SCHOOL_CONFIG } from "@/components/utils/schoolConfig";
import { getMoodEmoji } from "@/components/utils/moodUtils";
import { useThemeTokens } from "@/components/utils/ThemeProvider";
import { useScrollDirection } from "@/components/utils/useScrollDirection";
import AdminSchoolSwitcher from "@/components/utils/AdminSchoolSwitcher";

export default function SchoolTopBar({ currentUser, onUserUpdate, onPost, activePage = "feed", schoolConfig, schoolCode, hideFABs = false, alwaysSticky = false }) {
  const [showProfile, setShowProfile] = useState(false);
  const tokens = useThemeTokens(schoolConfig);
  const primary = tokens.primary;
  const isAdmin = currentUser?.role === "admin";
  const scrollDirection = useScrollDirection();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    if (currentUser?.email) {
      base44.entities.Notification.filter({ user_email: currentUser.email, read: false })
        .then(res => setUnreadCount(res.length))
        .catch(() => { });

      base44.entities.MarketThread.list()
        .then(threads => {
          const myThreads = threads.filter(t => t.buyer_email === currentUser.email || t.seller_email === currentUser.email);
          if (myThreads.length > 0) {
            Promise.all(myThreads.map(t => base44.entities.MarketMessage.filter({ thread_id: t.id, read: false })))
              .then(results => {
                let count = 0;
                results.flat().forEach(msg => {
                  const thread = myThreads.find(t => t.id === msg.thread_id);
                  const myRole = thread.seller_email === currentUser.email ? "seller" : "buyer";
                  if (msg.sender_role !== myRole && msg.sender_role !== "system") {
                    count++;
                  }
                });
                setUnreadMessages(count);
              }).catch(() => { });
          }
        })
        .catch(() => { });
    }
  }, [currentUser]);

  return (
    <>
      <div className={`sticky z-40 bg-white/70 backdrop-blur-md border-b border-slate-100 ${alwaysSticky
        ? "top-0"
        : `transition-all duration-300 ${scrollDirection === 'down' ? '-top-20' : 'top-0'}`
        }`}>
        <div className="max-w-xl mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            {/* Left: profile + school name */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowProfile(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: tokens.primaryLight }}
                title="Your profile"
              >
                {getMoodEmoji(currentUser?.mood)}
              </button>

              {isAdmin ? (
                <AdminSchoolSwitcher
                  currentSchool={schoolCode || schoolConfig?.id || currentUser?.school || 'ETHZ'}
                  onSchoolChange={(code) => {
                    onUserUpdate({ school: code });
                    const params = new URLSearchParams(window.location.search);
                    params.set('school', code);
                    window.location.href = window.location.pathname + '?' + params.toString();
                  }}
                  tokens={tokens}
                />
              ) : (
                <h1 className="text-sm font-black text-slate-900 tracking-tight">{schoolConfig?.name || "🦇 Echo"}</h1>
              )}
            </div>

            {/* Right: Nav tabs */}
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
              <button
                onClick={() => window.location.href = createPageUrl("Leaderboard") + `?school=${schoolCode}`}
                className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${activePage === "leaderboard" || activePage === "stats" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
              >
                Stats
              </button>
            </div>
          </div>
        </div>
      </div>

      {!hideFABs && (
        <>
          {/* Floating Notification Button */}
          <div className="fixed bottom-6 left-6 z-50">
            {showNotifMenu && (
              <div className="absolute bottom-14 left-0 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2 animate-in slide-in-from-bottom-2 fade-in">
                <button
                  onClick={() => window.location.href = createPageUrl("Notifications")}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="relative">
                    <Bell className="w-5 h-5 text-slate-600" />
                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>}
                  </div>
                  <span className="text-sm font-medium text-slate-700">Notifications</span>
                </button>
                <button
                  onClick={() => window.location.href = createPageUrl("MarketInbox")}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="relative">
                    <MessageCircle className="w-5 h-5 text-slate-600" />
                    {unreadMessages > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>}
                  </div>
                  <span className="text-sm font-medium text-slate-700">Messages</span>
                </button>
              </div>
            )}

            {showNotifMenu && (
              <div className="fixed inset-0 z-[-1]" onClick={() => setShowNotifMenu(false)} />
            )}

            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-white text-slate-600 shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Bell className="w-5 h-5" />
              {(unreadCount > 0 || unreadMessages > 0) && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>}
            </button>
          </div>

          {/* Floating Post Button */}
          <button
            onClick={onPost}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl transition-all hover:shadow-2xl hover:scale-105 active:scale-95 opacity-70 hover:opacity-100"
            style={{ backgroundColor: primary }}
          >
            <Plus className="w-6 h-6" />
          </button>
        </>
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