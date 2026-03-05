import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import CategoryFilter from "@/components/feed/CategoryFilter";
import CreatePostModal from "@/components/feed/CreatePostModal";

const sortOptions = [
  { key: "new", label: "Recent" },
  { key: "hot", label: "Popular" },
  { key: "top", label: "Top" },
];

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
        data = [...data].sort((a, b) => ((b.upvotes || 0) + (b.comment_count || 0)) - ((a.upvotes || 0) + (a.comment_count || 0)));
      } else if (sort === "top") {
        data = [...data].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      }
      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [category, sort]);

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4">
          {/* Brand row */}
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-2">
              <span className="text-[#E8344E] font-bold text-lg tracking-tight">fizz</span>
              <span className="text-gray-300 text-sm">|</span>
              <span className="text-gray-500 text-sm">Campus Board</span>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#E8344E] text-white text-[13px] font-medium hover:bg-[#d02d43] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Write
            </button>
          </div>

          {/* Sort tabs row */}
          <div className="flex gap-0 border-b border-gray-100 -mb-px">
            {sortOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={`px-4 py-2.5 text-[13px] font-medium transition-colors relative ${
                  sort === key ? "text-[#E8344E]" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
                {sort === key && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E8344E]" />
                )}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <CategoryFilter selected={category} onSelect={setCategory} />
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white mt-2 rounded-sm overflow-hidden shadow-sm">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="px-5 py-4 border-b border-gray-50 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                    <div className="h-3.5 bg-gray-100 rounded w-full" />
                    <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                    <div className="flex gap-4">
                      <div className="h-3 w-12 bg-gray-100 rounded" />
                      <div className="h-3 w-12 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-sm">No posts yet in this category.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-3 text-[#E8344E] text-sm font-medium hover:underline"
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