import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import PostCard from "@/components/feed/PostCard";
import CreatePostModal from "@/components/feed/CreatePostModal";
import SchoolTopBar from "@/components/feed/SchoolTopBar";
import TopBar from "@/components/feed/TopBar";
import { getSchoolConfig } from "@/components/utils/schoolConfig";

export default function Events() {
  const params = new URLSearchParams(window.location.search);
  const schoolCode = params.get("school");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const configSchoolCode = schoolCode || currentUser?.school;
  const schoolConfig = getSchoolConfig(configSchoolCode);

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      if (!u?.school_verified && u?.role !== "admin") {
        window.location.href = createPageUrl("Onboarding");
        return;
      }
      if (u?.role !== "admin" && u?.school !== schoolCode && schoolCode) {
        window.location.href = createPageUrl("Events") + `?school=${u.school}`;
      }
    }).catch(() => base44.auth.redirectToLogin(createPageUrl("Events") + (schoolCode ? `?school=${schoolCode}` : "")));
  }, [schoolCode]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let data = await base44.entities.Post.filter({ category: "events" }, "-created_date", 200);

      // Filter to this school's posts
      if (configSchoolCode) {
        data = data.filter(p => {
          if (!p.department || p.department === "all") return true;
          if (configSchoolCode === "ETH") return p.department.startsWith("D-") || p.department === "ETH";
          return p.department === configSchoolCode;
        });
      }

      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [configSchoolCode]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: schoolConfig.bg }}>
      {schoolCode ? (
        <SchoolTopBar
          currentUser={currentUser}
          onUserUpdate={u => setCurrentUser(u)}
          onPost={() => setShowCreate(true)}
          activePage="events"
          schoolConfig={schoolConfig}
          schoolCode={schoolCode}
        />
      ) : (
        <TopBar
          currentUser={currentUser}
          onUserUpdate={u => setCurrentUser(u)}
          onPost={() => setShowCreate(true)}
          postLabel="Post Event"
          activePage="events"
          schoolConfig={schoolConfig}
        />
      )}

      <div className="max-w-xl mx-auto px-4 py-6 space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-slate-200" />
                <div className="space-y-1">
                  <div className="h-3 w-28 bg-slate-200 rounded" />
                  <div className="h-2.5 w-16 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3.5 bg-slate-200 rounded w-full" />
                <div className="h-3.5 bg-slate-200 rounded w-4/5" />
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-slate-500 font-medium">No events yet</p>
            <p className="text-slate-400 text-sm mt-1">Be the first to post an event!</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 px-6 py-2.5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-all"
              style={{ backgroundColor: schoolConfig.primary }}
            >
              Create an event
            </button>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} currentUser={currentUser} onUpdate={fetchPosts} />
          ))
        )}
      </div>

      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchPosts}
          currentUser={currentUser}
          schoolConfig={schoolConfig}
          isEvent={true}
        />
      )}
    </div>
  );
}