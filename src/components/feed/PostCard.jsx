import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, MessageSquare } from "lucide-react";
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
      className="bg-white border-b border-[#e8e8e8] px-4 py-4 cursor-pointer hover:bg-[#fafafa] transition-colors"
    >
      {/* Author + meta */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold"
          style={{ backgroundColor: post.author_color || "#E4332D" }}
        >
          {post.author_alias?.charAt(0) || "A"}
        </div>
        <span className="text-[12px] text-[#888]">{post.author_alias || "Anonymous"}</span>
        <span className="text-[#ccc] text-[11px]">·</span>
        <span className="text-[11px] text-[#aaa]">{timeAgo}</span>
        {post.category && (
          <>
            <span className="text-[#ccc] text-[11px]">·</span>
            <span className="text-[11px] text-[#E4332D] font-medium capitalize">{post.category}</span>
          </>
        )}
      </div>

      {/* Content */}
      <p className="text-[14px] text-[#222] leading-snug line-clamp-2 mb-2.5">{post.content}</p>

      {/* Image thumbnail */}
      {post.image_url && (
        <div className="mb-2.5">
          <img src={post.image_url} alt="" className="h-16 w-24 object-cover rounded border border-[#eee]" />
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleVote}
          className={`flex items-center gap-1 text-[12px] transition-colors ${
            votedUp ? "text-[#E4332D]" : "text-[#aaa] hover:text-[#E4332D]"
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>{post.upvotes || 0}</span>
        </button>
        <span className="flex items-center gap-1 text-[12px] text-[#aaa]">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{post.comment_count || 0}</span>
        </span>
      </div>
    </div>
  );
}