import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, ArrowDown, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";


const categoryColors = {
  general: "bg-slate-100 text-slate-600",
  academics: "bg-blue-50 text-blue-600",
  social: "bg-pink-50 text-pink-600",
  housing: "bg-amber-50 text-amber-600",
  food: "bg-orange-50 text-orange-600",
  sports: "bg-green-50 text-green-600",
  rants: "bg-red-50 text-red-600",
  confessions: "bg-purple-50 text-purple-600",
  advice: "bg-teal-50 text-teal-600",
  events: "bg-indigo-50 text-indigo-600",
};

export default function PostCard({ post, currentUser, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userId = currentUser?.id || "anon";
  const votedUp = post.voted_up_by?.includes(userId);
  const votedDown = post.voted_down_by?.includes(userId);
  const score = (post.upvotes || 0) - (post.downvotes || 0);

  const handleVote = async (e, type) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    let newVotedUp = [...(post.voted_up_by || [])];
    let newVotedDown = [...(post.voted_down_by || [])];
    let newUpvotes = post.upvotes || 0;
    let newDownvotes = post.downvotes || 0;

    if (type === "up") {
      if (votedUp) {
        newVotedUp = newVotedUp.filter(id => id !== userId);
        newUpvotes--;
      } else {
        newVotedUp.push(userId);
        newUpvotes++;
        if (votedDown) {
          newVotedDown = newVotedDown.filter(id => id !== userId);
          newDownvotes--;
        }
      }
    } else {
      if (votedDown) {
        newVotedDown = newVotedDown.filter(id => id !== userId);
        newDownvotes--;
      } else {
        newVotedDown.push(userId);
        newDownvotes++;
        if (votedUp) {
          newVotedUp = newVotedUp.filter(id => id !== userId);
          newUpvotes--;
        }
      }
    }

    await base44.entities.Post.update(post.id, {
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      voted_up_by: newVotedUp,
      voted_down_by: newVotedDown
    });
    onUpdate?.();
    setLoading(false);
  };

  const timeAgo = post.created_date
    ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true })
    : "";

  return (
    <div
      onClick={() => navigate(createPageUrl(`PostDetail?id=${post.id}`))}
      className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all duration-200 border border-slate-100 hover:border-slate-200 group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
            style={{ backgroundColor: post.author_color || "#6C63FF" }}
          >
            {post.author_alias?.charAt(0) || "A"}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{post.author_alias || "Anonymous"}</p>
            <p className="text-xs text-slate-400">{timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post.category && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryColors[post.category] || categoryColors.general}`}>
              {post.category}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-slate-700 text-[15px] leading-relaxed mb-3 line-clamp-4">{post.content}</p>

      {/* Image */}
      {post.image_url && (
        <div className="mb-3 rounded-xl overflow-hidden">
          <img src={post.image_url} alt="" className="w-full max-h-64 object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-slate-50">
        <button
          onClick={(e) => handleVote(e, "up")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
            votedUp ? "bg-violet-100 text-violet-600" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          }`}
        >
          <ArrowUp className="w-4 h-4" />
          <span>{post.upvotes || 0}</span>
        </button>

        <button
          onClick={(e) => handleVote(e, "down")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
            votedDown ? "bg-red-100 text-red-500" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          }`}
        >
          <ArrowDown className="w-4 h-4" />
          <span>{post.downvotes || 0}</span>
        </button>

        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all ml-auto"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.comment_count || 0}</span>
        </button>
      </div>
    </div>
  );
}