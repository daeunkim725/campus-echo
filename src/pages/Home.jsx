import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import BoardSidebar from "@/components/feed/BoardSidebar";
import CreatePostModal from "@/components/feed/CreatePostModal";

const boardLabels = {
  all: "All Posts", general: "Free Board", academics: "Academics", social: "Social",
  housing: "Housing", food: "Dining Hall", sports: "Sports", rants: "Rants",
  confessions: "Confessions", advice: "Advice", events: "Events"
};

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("new");
  const [showCreate, setShowCreate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let data = await base44.entities.Post.list("-created_date", 50);
      if (category !== "all") {
        data = data.filter(p => p.category === category);
      }
      if (sort === "hot") {
        data = data.sort((a, b) => ((b.upvotes || 0) + (b.comment_count || 0)) - ((a.upvotes || 0) + (a.comment_count || 0)));
      } else if (sort === "top") {
        data = data.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      }
      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [category, sort]);

  return (
    <div className="flex gap-0 min-h-screen pb-16 sm:pb-0">
      {/* Sidebar - desktop only */}
      <div className="hidden sm:block pt-4 pl-4">
        <BoardSidebar selected={category} onSelect={setCategory} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Board Header */}
        <div className="bg-white border-b border-[#e0e0e0] px-4 py-3 flex items-center justify-between sticky top-[52px] z-30">
          <div className="flex items-center gap-3">
            <h2 className="text-[15px] font-bold text-[#222]">{boardLabels[category]}</h2>
            {/* Mobile category pills */}
            <div className="sm:hidden flex gap-1.5 overflow-x-auto scrollbar-hide">
              {Object.entries(boardLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                    category === key
                      ? "bg-[#E4332D] text-white border-[#E4332D]"
                      : "border-[#ddd] text-[#666] bg-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="hidden sm:flex items-center gap-0 border border-[#ddd] rounded overflow-hidden">
              {[["new", "Latest"], ["hot", "Popular"], ["top", "Top"]].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={`px-3 py-1 text-[12px] transition-colors border-r border-[#ddd] last:border-r-0 ${
                    sort === key ? "bg-[#E4332D] text-white" : "bg-white text-[#555] hover:bg-[#f5f5f5]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#E4332D] text-white text-[12px] font-semibold rounded hover:bg-[#c42a25] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Write
            </button>
          </div>
        </div>

        {/* Post List */}
        <div className="bg-white border-x border-[#e0e0e0]">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="px-4 py-4 border-b border-[#e8e8e8] animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-[#eee]" />
                  <div className="h-3 w-20 bg-[#eee] rounded" />
                  <div className="h-3 w-12 bg-[#eee] rounded" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3.5 bg-[#eee] rounded w-full" />
                  <div className="h-3.5 bg-[#eee] rounded w-2/3" />
                </div>
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#aaa] text-[14px]">No posts in this board yet.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-3 px-4 py-2 bg-[#E4332D] text-white text-[13px] rounded hover:bg-[#c42a25] transition-colors"
              >
                Be the first to post
              </button>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onUpdate={fetchPosts}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchPosts}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}