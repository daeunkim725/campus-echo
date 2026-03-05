import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, ArrowDown, MessageCircle, BarChart2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

const categoryColors = {
  general: "bg-slate-100 text-slate-600",
  academics: "bg-blue-50 text-blue-600",
  social: "bg-pink-50 text-pink-600",
  housing: "bg-amber-50 text-amber-600",
  food: "bg-orange-50 text-orange-600",
  rants: "bg-red-50 text-red-600",
  confessions: "bg-purple-50 text-purple-600",
  advice: "bg-teal-50 text-teal-600",
  events: "bg-indigo-50 text-indigo-600",
};

export default function PostCard({ post, currentUser, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const navigate = useNavigate();

  const userId = currentUser?.id || "anon";
  const votedUp = localPost.voted_up_by?.includes(userId);
  const votedDown = localPost.voted_down_by?.includes(userId);

  const handleVote = async (e, type) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    let newVotedUp = [...(localPost.voted_up_by || [])];
    let newVotedDown = [...(localPost.voted_down_by || [])];
    let newUpvotes = localPost.upvotes || 0;
    let newDownvotes = localPost.downvotes || 0;

    if (type === "up") {
      if (votedUp) { newVotedUp = newVotedUp.filter(id => id !== userId); newUpvotes--; }
      else { newVotedUp.push(userId); newUpvotes++; if (votedDown) { newVotedDown = newVotedDown.filter(id => id !== userId); newDownvotes--; } }
    } else {
      if (votedDown) { newVotedDown = newVotedDown.filter(id => id !== userId); newDownvotes--; }
      else { newVotedDown.push(userId); newDownvotes++; if (votedUp) { newVotedUp = newVotedUp.filter(id => id !== userId); newUpvotes--; } }
    }

    const updated = { ...localPost, upvotes: newUpvotes, downvotes: newDownvotes, voted_up_by: newVotedUp, voted_down_by: newVotedDown };
    setLocalPost(updated);
    await base44.entities.Post.update(localPost.id, { upvotes: newUpvotes, downvotes: newDownvotes, voted_up_by: newVotedUp, voted_down_by: newVotedDown });
    onUpdate?.();
    setLoading(false);
  };

  const handlePollVote = async (e, optionIndex) => {
    e.stopPropagation();
    if (!localPost.poll_options) return;
    const alreadyVoted = localPost.poll_options.some(o => o.voted_by?.includes(userId));
    if (alreadyVoted) return;

    const newOptions = localPost.poll_options.map((opt, i) => {
      if (i === optionIndex) return { ...opt, votes: (opt.votes || 0) + 1, voted_by: [...(opt.voted_by || []), userId] };
      return opt;
    });
    const updated = { ...localPost, poll_options: newOptions };
    setLocalPost(updated);
    await base44.entities.Post.update(localPost.id, { poll_options: newOptions });
  };

  const totalPollVotes = localPost.poll_options?.reduce((s, o) => s + (o.votes || 0), 0) || 0;
  const hasVotedPoll = localPost.poll_options?.some(o => o.voted_by?.includes(userId));

  const timeAgo = localPost.created_date
    ? formatDistanceToNow(new Date(localPost.created_date), { addSuffix: true })
    : "";

  return (
    <div
      onClick={() => navigate(createPageUrl(`PostDetail?id=${localPost.id}`))}
      className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all duration-200 border border-slate-100 hover:border-slate-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
            style={{ backgroundColor: localPost.author_color || "#6C63FF" }}>
            {localPost.author_alias?.charAt(0) || "A"}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{localPost.author_alias || "Anonymous"}</p>
            <p className="text-xs text-slate-400">{timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {localPost.department && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-medium border border-violet-100">
              {localPost.department}
            </span>
          )}
          {localPost.academic_level && localPost.academic_level !== "all" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
              {localPost.academic_level}
            </span>
          )}
          {localPost.category && (
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${categoryColors[localPost.category] || categoryColors.general}`}>
              {localPost.category}
            </span>
          )}
          {localPost.post_type === "poll" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium flex items-center gap-1">
              <BarChart2 className="w-3 h-3" /> Poll
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-slate-700 text-[15px] leading-relaxed mb-3 line-clamp-4">{localPost.content}</p>

      {/* Poll Options */}
      {localPost.post_type === "poll" && localPost.poll_options && (
        <div className="space-y-2 mb-3" onClick={e => e.stopPropagation()}>
          {localPost.poll_options.map((opt, i) => {
            const pct = totalPollVotes > 0 ? Math.round((opt.votes || 0) / totalPollVotes * 100) : 0;
            const myVote = opt.voted_by?.includes(userId);
            return (
              <button
                key={i}
                onClick={(e) => handlePollVote(e, i)}
                disabled={hasVotedPoll}
                className={`w-full text-left rounded-xl border px-3 py-2.5 text-sm font-medium transition-all relative overflow-hidden ${
                  myVote ? "border-violet-400 text-violet-700" : hasVotedPoll ? "border-slate-200 text-slate-600" : "border-slate-200 text-slate-700 hover:border-violet-300"
                }`}
              >
                {hasVotedPoll && (
                  <div className={`absolute inset-0 rounded-xl ${myVote ? "bg-violet-50" : "bg-slate-50"}`} style={{ width: `${pct}%` }} />
                )}
                <span className="relative flex items-center justify-between">
                  <span>{opt.text}</span>
                  {hasVotedPoll && <span className="text-xs text-slate-400">{pct}%</span>}
                </span>
              </button>
            );
          })}
          <p className="text-xs text-slate-400">{totalPollVotes} vote{totalPollVotes !== 1 ? "s" : ""}</p>
        </div>
      )}

      {/* Image */}
      {localPost.image_url && (
        <div className="mb-3 rounded-xl overflow-hidden">
          <img src={localPost.image_url} alt="" className="w-full max-h-64 object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-2 border-t border-slate-50">
        <button onClick={(e) => handleVote(e, "up")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${votedUp ? "bg-violet-100 text-violet-600" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}>
          <ArrowUp className="w-4 h-4" /><span>{localPost.upvotes || 0}</span>
        </button>
        <button onClick={(e) => handleVote(e, "down")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${votedDown ? "bg-red-100 text-red-500" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}>
          <ArrowDown className="w-4 h-4" /><span>{localPost.downvotes || 0}</span>
        </button>
        <button onClick={e => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all ml-auto">
          <MessageCircle className="w-4 h-4" /><span>{localPost.comment_count || 0}</span>
        </button>
      </div>
    </div>
  );
}