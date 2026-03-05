import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, MessageSquare, Image as ImageIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function PostCard({ post, currentUser, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userId = currentUser?.id || "anon";
  const votedUp = post.voted_up_by?.includes(userId);

  const handleVote = async (e) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    let newVotedUp = [...(post.voted_up_by || [])];
    let newUpvotes = post.upvotes || 0;
    if (votedUp) {
      newVotedUp = newVotedUp.filter(id => id !== userId);
      newUpvotes--;
    } else {
      newVotedUp.push(userId);
      newUpvotes++;
    }
    await base44.entities.Post.update(post.id, { upvotes: newUpvotes, voted_up_by: newVotedUp });
    onUpdate?.();
    setLoading(false);
  };

  const timeAgo = post.created_date
    ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true })
    : "";

  return (
    <div
      onClick={() => navigate(createPageUrl(`PostDetail?id=${post.id}`))}
      className="post-row bg-white px-5 py-4 cursor-pointer hover:bg-[#fafafa] transition-colors duration-100"
    >
      <div className="flex items-start gap-4">
        {/* Left: avatar dot */}
        <div className="flex-shrink-0 mt-0.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold"
            style={{ backgroundColor: post.author_color || "#E8344E" }}
          >
            {post.author_alias?.charAt(0) || "A"}
          </div>
        </div>

        {/* Middle: content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13px] font-medium text-gray-800">{post.author_alias || "Anonymous"}</span>
            {post.category && (
              <span className="text-[11px] text-[#E8344E] font-medium">#{post.category}</span>
            )}
          </div>
          <p className="text-[14px] text-gray-700 leading-snug line-clamp-2 mb-2">{post.content}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleVote}
              className={`flex items-center gap-1 text-[12px] transition-colors ${
                votedUp ? "text-[#E8344E] font-medium" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{post.upvotes || 0}</span>
            </button>
            <span className="flex items-center gap-1 text-[12px] text-gray-400">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{post.comment_count || 0}</span>
            </span>
            {post.image_url && (
              <span className="flex items-center gap-1 text-[12px] text-gray-400">
                <ImageIcon className="w-3.5 h-3.5" />
              </span>
            )}
            <span className="ml-auto text-[11px] text-gray-300">{timeAgo}</span>
          </div>
        </div>

        {/* Right: thumbnail if image */}
        {post.image_url && (
          <div className="flex-shrink-0 w-14 h-14 rounded overflow-hidden bg-gray-100">
            <img src={post.image_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}