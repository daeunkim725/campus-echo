import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { apiLogout } from "@/api/apiClient";
import { X, Sun, Moon, LogOut, Pencil, Trash2, Check, ShieldAlert, RotateCcw, Archive, ChevronDown, ChevronRight } from "lucide-react";
import { getMoodEmoji } from "@/components/utils/moodUtils";
import { getShortTimeAgo } from "@/components/utils/timeUtils";
import { createPageUrl } from "@/utils";
import { useThemeTokens, useTheme } from "@/components/utils/ThemeProvider";

const MOODS = [
  { value: "happy", label: "Happy 😊" },
  { value: "sleepy", label: "Sleepy 😴" },
  { value: "anxious", label: "Anxious 😰" },
  { value: "focused", label: "Focused 🎯" },
  { value: "bored", label: "Bored 😐" },
  { value: "excited", label: "Excited 🤩" },
  { value: "stressed", label: "Stressed 😤" },
  { value: "chill", label: "Chill 😎" },
  { value: "hungry", label: "Hungry 🍕" },
  { value: "caffeinated", label: "Caffeinated ☕" },
  { value: "lost", label: "Lost 🗺️" },
  { value: "vibing", label: "Vibing 🎵" },
];

export function getMoodLabel(val) {
  return MOODS.find(m => m.value === val)?.label || val || "Anonymous";
}

export default function ProfilePanel({ currentUser, onClose, onUserUpdate, schoolConfig }) {
  const [myPosts, setMyPosts] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMood, setEditingMood] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [isSoldCollapsed, setIsSoldCollapsed] = useState(true);
  const [selectedMood, setSelectedMood] = useState(currentUser?.mood || "");
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [visiblePostsCount, setVisiblePostsCount] = useState(5);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const tokens = useThemeTokens(schoolConfig);
  const primary = tokens.primary;
  const { theme, setTheme } = useTheme();
  const darkMode = theme === "dark";

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    setLoading(true);
    const [posts, listings] = await Promise.all([
      base44.entities.Post.list("-created_date", 200),
      base44.entities.MarketListing.list("-created_date", 200)
    ]);
    setMyPosts(posts.filter(p => p.created_by === currentUser?.email));
    setMyListings(listings.filter(l => l.created_by === currentUser?.email));
    setLoading(false);
  };

  const handleRelist = async (listing) => {
    setLoading(true);
    await base44.entities.MarketListing.create({
      title: listing.title,
      description: listing.description,
      price: listing.price,
      image_url: listing.image_url,
      school: listing.school,
      author_alias: listing.author_alias,
      author_color: listing.author_color,
      condition: listing.condition,
      category: listing.category,
      pickup_location: listing.pickup_location,
      saved_by: [],
      status: "active"
    });
    fetchMyPosts();
  };

  const handleBulkArchiveSold = async () => {
    const sold = myListings.filter(l => l.status === "sold");
    for (const l of sold) {
      await base44.entities.MarketListing.update(l.id, { status: "archived" });
    }
    fetchMyPosts();
  };

  const handleBulkDeleteSold = async () => {
    const sold = myListings.filter(l => l.status === "sold");
    for (const l of sold) {
      await base44.entities.MarketListing.delete(l.id);
    }
    fetchMyPosts();
  };

  const handleMoodSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ mood: selectedMood });
    onUserUpdate({ ...currentUser, mood: selectedMood });
    setEditingMood(false);
    setSaving(false);
  };

  const handleToggleDark = () => {
    setTheme(darkMode ? "light" : "dark");
  };

  const handleEditPost = async (post) => {
    setSaving(true);
    await base44.entities.Post.update(post.id, {
      content: editContent,
      edited: true,
    });
    setEditingPost(null);
    setEditContent("");
    fetchMyPosts();
    setSaving(false);
  };

  const handleDeletePost = async (post) => {
    await base44.entities.Post.update(post.id, {
      content: "[deleted]",
      edited: false,
      deleted: true,
    });
    fetchMyPosts();
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      // 1. Call backend logout endpoint
      try { await apiLogout(); } catch { /* ignore backend errors */ }
      // 2. Try Base44 SDK logout too
      try { await base44.auth.logout(); } catch { /* ignore */ }
    } catch { /* ignore */ }

    // 3. Clear ALL auth & cached state from localStorage
    localStorage.removeItem("campus_echo_token");
    localStorage.removeItem("campus_echo_user");
    localStorage.removeItem("campus_echo_theme");
    localStorage.removeItem("admin_setup_complete");

    // Clear any Base44 SDK keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("base44") || key.startsWith("b44") || key.includes("token") || key.includes("session"))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // 4. Clear session cookies
    document.cookie.split(";").forEach(c => {
      document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });

    // 5. Navigate to Login, replacing history to prevent back-button access
    window.location.replace("/Login");
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Sign-out confirmation dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={e => e.stopPropagation()}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Sign out?</h3>
                <p className="text-xs text-slate-400">You'll need to log in again.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel */}
      <div
        className="relative w-full max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-left flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100" style={{ borderTopColor: primary, borderTopWidth: 4 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Your Profile</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar + mood */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                style={{ backgroundColor: tokens.primaryLight }}>
                {getMoodEmoji(currentUser?.mood)}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-base">{getMoodLabel(currentUser?.mood)}</p>
                <p className="text-xs text-slate-400">{currentUser?.school || "fizz community"}</p>
              </div>
            </div>

            {/* Change mood */}
            {editingMood ? (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">How are you feeling?</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {MOODS.map(m => (
                    <button
                      key={m.value}
                      onClick={() => setSelectedMood(m.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedMood === m.value
                        ? "text-white border-transparent"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      style={selectedMood === m.value ? { backgroundColor: primary, borderColor: primary, color: darkMode ? tokens.surface : "#FFFFFF" } : {}}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingMood(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm text-slate-500">Cancel</button>
                  <button
                    onClick={handleMoodSave}
                    disabled={!selectedMood || saving}
                    className="flex-1 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
                    style={{ backgroundColor: primary, color: darkMode ? tokens.surface : "#FFFFFF" }}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingMood(true)}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 hover:border-slate-300 transition-all"
              >
                <Pencil className="w-3 h-3" /> Change mood
              </button>
            )}
          </div>

          {/* Tabs for Posts and Listings */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-3 text-sm font-semibold transition-all ${activeTab === "posts" ? "text-slate-900 border-b-2" : "text-slate-500"}`}
              style={activeTab === "posts" ? { borderBottomColor: primary } : {}}
            >
              Posts ({myPosts.length})
            </button>
            <button
              onClick={() => setActiveTab("listings")}
              className={`flex-1 py-3 text-sm font-semibold transition-all ${activeTab === "listings" ? "text-slate-900 border-b-2" : "text-slate-500"}`}
              style={activeTab === "listings" ? { borderBottomColor: primary } : {}}
            >
              Listings ({myListings.filter(l => l.status !== 'archived').length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : activeTab === "posts" ? (
              myPosts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">You haven't posted anything yet.</p>
              ) : (
                <div className="space-y-3">
                  {myPosts.slice(0, visiblePostsCount).map(post => (
                    <div key={post.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      {editingPost === post.id ? (
                        <div>
                          <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-xl p-3 resize-none min-h-[80px] focus:outline-none"
                          />
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => setEditingPost(null)} className="flex-1 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500">Cancel</button>
                            <button
                              onClick={() => handleEditPost(post)}
                              disabled={saving}
                              className="flex-1 py-1.5 text-xs rounded-lg text-white font-medium disabled:opacity-40"
                              style={{ backgroundColor: primary, color: darkMode ? tokens.surface : "#FFFFFF" }}
                            >
                              <Check className="w-3 h-3 inline mr-1" />Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className={`text-sm mb-2 ${post.deleted ? "text-slate-400 italic" : "text-slate-700"}`}>
                            {post.content}
                          </p>
                          {post.edited && !post.deleted && (
                            <span className="text-xs text-slate-400 italic">edited</span>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-400">
                              {post.created_date ? getShortTimeAgo(post.created_date) : ""}
                            </span>
                            {!post.deleted && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => { setEditingPost(post.id); setEditContent(post.content); }}
                                  className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-slate-600 transition-all"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeletePost(post)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {myPosts.length > visiblePostsCount && (
                    <button
                      onClick={() => setVisiblePostsCount(prev => prev + 5)}
                      className="w-full py-2 mt-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      Show more posts
                    </button>
                  )}
                </div>
              )
            ) : (
              <div className="space-y-4">
                {/* Active Listings */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active</h3>
                  {myListings.filter(l => l.status !== "sold" && l.status !== "archived").length === 0 ? (
                    <p className="text-sm text-slate-400 mb-4">No active listings.</p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {myListings.filter(l => l.status !== "sold" && l.status !== "archived").map(listing => (
                        <div key={listing.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3 overflow-hidden">
                            {listing.image_url ? (
                              <img src={listing.image_url} alt={listing.title} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                            ) : (
                              <div className="w-10 h-10 bg-slate-200 rounded-lg shrink-0 flex items-center justify-center text-slate-400 text-xs font-bold">$</div>
                            )}
                            <div className="truncate">
                              <p className="text-sm font-bold text-slate-900 truncate">{listing.title}</p>
                              <p className="text-xs text-slate-500">${listing.price.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sold Listings */}
                {myListings.filter(l => l.status === "sold").length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => setIsSoldCollapsed(!isSoldCollapsed)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
                      >
                        {isSoldCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        Sold ({myListings.filter(l => l.status === "sold").length})
                      </button>
                      {!isSoldCollapsed && (
                        <div className="flex gap-2">
                          <button onClick={handleBulkArchiveSold} className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-slate-700"><Archive className="w-3 h-3" /> Archive All</button>
                          <button onClick={handleBulkDeleteSold} className="text-[10px] flex items-center gap-1 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /> Delete All</button>
                        </div>
                      )}
                    </div>

                    {!isSoldCollapsed && (
                      <div className="space-y-2 mt-3 pl-1 border-l-2 border-slate-100 ml-1.5 pb-2">
                        {myListings.filter(l => l.status === "sold").map(listing => (
                          <div key={listing.id} className="flex items-center justify-between py-2 pl-3 pr-2 opacity-75 group hover:opacity-100 transition-opacity">
                            <div className="truncate flex-1 pr-3">
                              <p className="text-sm font-medium text-slate-700 line-through truncate group-hover:text-slate-900">{listing.title}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                Sold {listing.updated_date ? getShortTimeAgo(listing.updated_date) : ''} for <span className="font-semibold text-slate-700">${listing.price.toFixed(2)}</span>
                              </p>
                            </div>
                            <button
                              onClick={() => handleRelist(listing)}
                              className="shrink-0 px-2 py-1 bg-white text-slate-600 text-xs font-medium rounded-lg border border-slate-200 flex items-center gap-1 hover:bg-slate-50 shadow-sm"
                            >
                              <RotateCcw className="w-3 h-3" /> Relist
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Settings (Moved to bottom) */}
          <div className="p-3 border-t border-slate-100 space-y-0.5 bg-slate-50 mt-auto">
            {currentUser?.role === 'admin' && (
              <>
              <button
                onClick={() => window.location.href = createPageUrl("Moderation")}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-indigo-100 text-indigo-600 text-xs font-medium transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Moderation Queue
              </button>
              <button
                onClick={() => window.location.href = createPageUrl("Dashboard")}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-amber-100 text-amber-600 text-xs font-medium transition-all mt-1"
              >
                <Activity className="w-3.5 h-3.5" />
                Dashboard
              </button>
              </>
            )}
            <div
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all"
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                {darkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                {darkMode ? "Dark Mode" : "Light Mode"}
              </div>
              <button
                onClick={handleToggleDark}
                className={`w-8 h-4 rounded-full transition-all ${darkMode ? "" : "bg-slate-200"}`} style={darkMode ? { backgroundColor: primary } : {}}>
                <div className={`w-3 h-3 rounded-full bg-white shadow mt-0.5 transition-all ${darkMode ? "ml-4" : "ml-0.5"}`} style={{ marginLeft: darkMode ? "18px" : "2px" }} />
              </button>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-red-100 text-red-500 text-xs font-medium transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}