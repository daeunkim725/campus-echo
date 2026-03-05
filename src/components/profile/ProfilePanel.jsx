import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Sun, Moon, LogOut, Pencil, Trash2, Check } from "lucide-react";
import { getMoodEmoji } from "@/components/utils/moodUtils";
import { formatDistanceToNow } from "date-fns";
import { createPageUrl } from "@/utils";

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
  const [loading, setLoading] = useState(true);
  const [editingMood, setEditingMood] = useState(false);
  const [selectedMood, setSelectedMood] = useState(currentUser?.mood || "");
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains("dark"));
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const primary = schoolConfig?.primary || "#7C3AED";

  useEffect(() => {
    fetchMyPosts();
    // Apply saved dark mode preference on load
    if (currentUser?.dark_mode) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, [currentUser?.dark_mode]);

  const fetchMyPosts = async () => {
    setLoading(true);
    const all = await base44.entities.Post.list("-created_date", 200);
    const mine = all.filter(p => p.created_by === currentUser?.email);
    setMyPosts(mine);
    setLoading(false);
  };

  const handleMoodSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ mood: selectedMood });
    onUserUpdate({ ...currentUser, mood: selectedMood });
    setEditingMood(false);
    setSaving(false);
  };

  const handleToggleDark = async () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(prev => !prev);
    const newDarkMode = !darkMode;
    try {
      await base44.auth.updateMe({ dark_mode: newDarkMode });
    } catch (e) {}
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

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-sm h-full overflow-y-auto shadow-2xl animate-in slide-in-from-left transition-colors duration-300"
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: darkMode ? (schoolConfig?.darkCard || "#1A1F2E") : "white",
          color: darkMode ? (schoolConfig?.darkText || "#E8EAED") : "rgb(15, 23, 42)"
        }}
      >
        {/* Header */}
        <div className="p-5 border-b transition-colors duration-300" style={{ 
          borderTopColor: primary, 
          borderTopWidth: 4,
          borderBottomColor: darkMode ? "#2A3139" : "rgb(226, 232, 240)"
        }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold transition-colors duration-300" style={{ color: darkMode ? schoolConfig?.darkText : "rgb(15, 23, 42)" }}>Your Profile</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300" style={{ 
              backgroundColor: darkMode ? schoolConfig?.darkBg : "rgb(241, 245, 249)",
              color: darkMode ? "#8B91A1" : "rgb(100, 116, 139)"
            }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar + mood */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
              style={{ backgroundColor: schoolConfig?.primaryLight || "#EDE9FE" }}>
              {getMoodEmoji(currentUser?.mood)}
            </div>
            <div>
              <p className="font-bold text-base transition-colors duration-300" style={{ color: darkMode ? schoolConfig?.darkText : "rgb(15, 23, 42)" }}>{getMoodLabel(currentUser?.mood)}</p>
              <p className="text-xs transition-colors duration-300" style={{ color: darkMode ? "#8B91A1" : "rgb(148, 163, 184)" }}>{currentUser?.school || "fizz community"}</p>
            </div>
          </div>

          {/* Change mood */}
          {editingMood ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2 transition-colors duration-300" style={{ color: darkMode ? "#8B91A1" : "rgb(148, 163, 184)" }}>How are you feeling?</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {MOODS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setSelectedMood(m.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedMood === m.value
                        ? "text-white border-transparent"
                        : darkMode ? "border-slate-600 text-slate-300 hover:border-slate-500" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                    style={!darkMode && selectedMood !== m.value ? { backgroundColor: "white" } : darkMode && selectedMood !== m.value ? { backgroundColor: schoolConfig?.darkBg } : {}}
                    style={selectedMood === m.value ? { backgroundColor: primary, borderColor: primary } : {}}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingMood(false)} className="flex-1 py-2 rounded-xl border text-sm transition-colors duration-300" style={{ 
                  borderColor: darkMode ? "#2A3139" : "rgb(226, 232, 240)",
                  color: darkMode ? "#8B91A1" : "rgb(107, 114, 128)"
                }}>Cancel</button>
                <button
                  onClick={handleMoodSave}
                  disabled={!selectedMood || saving}
                  className="flex-1 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
                  style={{ backgroundColor: primary }}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditingMood(true)}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
              style={{
                borderColor: darkMode ? "#2A3139" : "rgb(226, 232, 240)",
                color: darkMode ? "#8B91A1" : "rgb(107, 114, 128)"
              }}
            >
              <Pencil className="w-3 h-3" /> Change mood
            </button>
          )}
        </div>

        {/* Settings */}
        <div className="p-4 border-b space-y-1 transition-colors duration-300" style={{ borderBottomColor: darkMode ? "#2A3139" : "rgb(226, 232, 240)" }}>
          <button
            onClick={handleToggleDark}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
            style={{ backgroundColor: darkMode ? "rgba(107, 114, 128, 0.1)" : "" }}
          >
            <div className="flex items-center gap-2 text-sm font-medium transition-colors duration-300" style={{ color: darkMode ? schoolConfig?.darkText : "rgb(51, 65, 85)" }}>
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {darkMode ? "Dark Mode" : "Light Mode"}
            </div>
            <div className="w-10 h-5 rounded-full transition-all" style={{ backgroundColor: darkMode ? schoolConfig?.primary : "rgb(203, 213, 225)" }}>
              <div className="w-4 h-4 rounded-full bg-white shadow transition-all" style={{ marginLeft: darkMode ? "22px" : "2px", marginTop: "2px" }} />
            </div>
          </button>
          <button
            onClick={() => base44.auth.logout(createPageUrl("Home"))}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-500 text-sm font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        {/* My Posts */}
        <div className="p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Posts ({myPosts.length})</p>
          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : myPosts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">You haven't posted anything yet.</p>
          ) : (
            <div className="space-y-3">
              {myPosts.map(post => (
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
                          style={{ backgroundColor: primary }}
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
                          {post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : ""}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}