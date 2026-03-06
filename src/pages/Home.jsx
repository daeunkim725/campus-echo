import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import PostCard from "@/components/feed/PostCard";
import FilterDrawer from "@/components/feed/FilterDrawer";
import CreatePostModal from "@/components/feed/CreatePostModal";
import TopBar from "@/components/feed/TopBar";
import { getSchoolConfig } from "@/components/utils/schoolConfig";
import { useScrollDirection } from "@/components/utils/useScrollDirection";
import { useThemeTokens } from "@/components/utils/ThemeProvider";

const DEFAULT_FILTERS = { sort: "new", category: "all", department: "all", level: "all" };

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showCreate, setShowCreate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const scrollDirection = useScrollDirection();

  const effectiveSchool = currentUser?.school || (currentUser?.role === 'admin' ? 'ETH' : null);
  const schoolConfig = getSchoolConfig(effectiveSchool);
  const tokens = useThemeTokens(schoolConfig);

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      if (!u?.school_verified && u?.role !== 'admin') {
        window.location.href = createPageUrl("Onboarding");
        return;
      }
      // Redirect to school-specific page
      const school = u?.school || (u?.role === 'admin' ? 'ETH' : null);
      if (school) {
        window.location.href = createPageUrl("SchoolFeed") + `?school=${school}`;
      }
    }).catch(() => base44.auth.redirectToLogin(createPageUrl("Home")));
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let data = await base44.entities.Post.list("-created_date", 100);

      // Only show posts from the user's school community or untagged posts
      if (currentUser?.school) {
        data = data.filter(p => !p.department || p.department === "all" || p.department.startsWith("D-") && currentUser.school === "ETH" || p.department === currentUser.school);
      }

      if (filters.category !== "all") data = data.filter(p => p.category === filters.category);
      else data = data.filter(p => p.category !== "events");
      if (filters.department !== "all") data = data.filter(p => p.department === filters.department);
      if (filters.level !== "all") data = data.filter(p => p.academic_level === filters.level);

      if (filters.sort === "hot") {
        data = data.sort((a, b) => ((b.upvotes || 0) + (b.comment_count || 0)) - ((a.upvotes || 0) + (a.comment_count || 0)));
      } else if (filters.sort === "top") {
        data = data.sort((a, b) => ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0)));
      }
      // "new" is default (already sorted by -created_date)

      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [filters]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: tokens.bg }}>
      <TopBar
        currentUser={currentUser}
        onUserUpdate={u => setCurrentUser(u)}
        onPost={() => setShowCreate(true)}
        postLabel="Post"
        activePage="feed"
        schoolConfig={schoolConfig}
      />
      <div className={`sticky z-30 bg-white/70 backdrop-blur-md border-b border-slate-100 transition-all duration-300 ${scrollDirection === 'down' ? 'top-0' : 'top-[65px]'}`}>
        <div className="max-w-2xl mx-auto px-4 py-2.5">
          <FilterDrawer filters={filters} onChange={setFilters} userSchool={currentUser?.school} />
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
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
                <div className="h-3.5 bg-slate-200 rounded w-3/5" />
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
              className="mt-4 px-6 py-2.5 rounded-full text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: tokens.primary, color: tokens.surface }}
            >
              Create a post
            </button>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} currentUser={currentUser} onUpdate={fetchPosts} schoolConfig={schoolConfig} />
          ))
        )}
      </div>

      {showCreate && (
        <CreatePostModal onClose={() => setShowCreate(false)} onCreated={fetchPosts} currentUser={currentUser} />
      )}
    </div>
  );
}