import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import PostCard from "@/components/feed/PostCard";
import FilterDrawer from "@/components/feed/FilterDrawer";
import CreatePostModal from "@/components/feed/CreatePostModal";
import SchoolTopBar from "@/components/feed/SchoolTopBar";
import { getSchoolConfig, SCHOOL_CONFIG } from "@/components/utils/schoolConfig";
import { useThemeTokens } from "@/components/utils/ThemeProvider";

const DEFAULT_FILTERS = { sort: "new", category: "all", department: "all", level: "all" };

export default function SchoolFeed() {
  const params = new URLSearchParams(window.location.search);
  const schoolCode = params.get("school");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showCreate, setShowCreate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const schoolConfig = getSchoolConfig(schoolCode);
  const tokens = useThemeTokens(schoolConfig);

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      if (!u?.school_verified && u?.role !== "admin") {
        window.location.href = createPageUrl("Onboarding");
        return;
      }
      // Non-admin users can only see their own school
      if (u?.role !== "admin" && u?.school !== schoolCode) {
        window.location.href = createPageUrl("SchoolFeed") + `?school=${u.school}`;
      }
    }).catch(() => base44.auth.redirectToLogin(createPageUrl("SchoolFeed") + `?school=${schoolCode}`));
  }, [schoolCode]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let data = await base44.entities.Post.list("-created_date", 200);

      // Filter to this school's posts
      if (schoolCode) {
        data = data.filter(p => {
          if (!p.department || p.department === "all") return true;
          if (schoolCode === "ETH") return p.department.startsWith("D-") || p.department === "ETH";
          return p.department === schoolCode;
        });
      }

      // Keep deleted posts visible (they show [deleted] label)

      if (filters.category !== "all") data = data.filter(p => p.category === filters.category);
      else data = data.filter(p => p.category !== "events");
      if (filters.department !== "all") data = data.filter(p => p.department === filters.department);
      if (filters.level !== "all") data = data.filter(p => p.academic_level === filters.level);

      if (filters.sort === "hot") {
        data = data.sort((a, b) => ((b.upvotes || 0) + (b.comment_count || 0)) - ((a.upvotes || 0) + (a.comment_count || 0)));
      } else if (filters.sort === "top") {
        data = data.sort((a, b) => ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0)));
      }

      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolCode) fetchPosts();
  }, [filters, schoolCode]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: tokens.bg }}>
      <SchoolTopBar
        currentUser={currentUser}
        onUserUpdate={u => setCurrentUser(u)}
        onPost={() => setShowCreate(true)}
        activePage="feed"
        schoolConfig={schoolConfig}
        schoolCode={schoolCode}
      />

      <div className="sticky top-[65px] z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-xl mx-auto px-4 py-2.5">
          <FilterDrawer filters={filters} onChange={setFilters} userSchool={schoolCode} />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-3">
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
            <div className="text-5xl mb-4">👻</div>
            <p className="text-slate-500 font-medium">No posts yet</p>
            <p className="text-slate-400 text-sm mt-1">Be the first to post something!</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 px-6 py-2.5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-all"
              style={{ backgroundColor: tokens.primary }}
            >
              Create a post
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
        />
      )}
    </div>
  );
}