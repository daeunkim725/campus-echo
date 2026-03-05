import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Sun, Moon, LogOut, Pencil, Trash2, Check } from "lucide-react";
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
  }, []);

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

  const handleToggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(prev => !prev);
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
        className="relative w-full max-w-sm bg-white h-full overflow-y-auto shadow-2xl animate-in slide-in-from-left"
        onClick={e => e.stopPropagation()}
      >
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
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-sm"
              style={{ backgroundColor: primary }}>
              {getMoodLabel(currentUser?.mood)?.charAt(0) || "?"}
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
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedMood === m.value
                        ? "text-white border-transparent"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                    style={selectedMood === m.value ? { backgroundColor: primary, borderColor: primary } : {}}
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
                  style={{ backgroundColor: primary }}
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

        {/* Settings */}
        <div className="p-4 border-b border-slate-100 space-y-1">
          <button
            onClick={handleToggleDark}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all"
          >
            <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {darkMode ? "Dark Mode" : "Light Mode"}
            </div>
            <div className={`w-10 h-5 rounded-full transition-all ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow mt-0.5 transition-all ${darkMode ? "ml-5.5" : "ml-0.5"}`} style={{ marginLeft: darkMode ? "22px" : "2px" }} />
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