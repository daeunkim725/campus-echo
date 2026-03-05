import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, ArrowDown, MessageCircle, BarChart2, MoreHorizontal, Pencil, Trash2, Calendar, MapPin, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { getSchoolConfig } from "@/components/utils/schoolConfig";
import { useNavigate } from "react-router-dom";
import EditPostModal from "@/components/feed/EditPostModal";
import { PlayableGif } from "@/components/ui/PlayableGif";
import { getCleanAlias, getAliasEmoji } from "@/components/utils/moodUtils";

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
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const navigate = useNavigate();

  const userId = currentUser?.id || "anon";
  const isOwner = localPost.created_by === currentUser?.email;
  const votedUp = localPost.voted_up_by?.includes(userId);
  const votedDown = localPost.voted_down_by?.includes(userId);
  
  const schoolConfig = getSchoolConfig(currentUser?.school);
  const primary = schoolConfig?.primary || "#7C3AED";
  const primaryLight = schoolConfig?.primaryLight || "#EDE9FE";

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

  const handleDelete = async (e) => {
    e.stopPropagation();
    setShowMenu(false);
    await base44.entities.Post.update(localPost.id, { deleted: true });
    setLocalPost({ ...localPost, deleted: true });
    onUpdate?.();
  };

  const handleEditSaved = () => {
    // Re-fetch from parent
    onUpdate?.();
    setShowEdit(false);
  };

  const totalPollVotes = localPost.poll_options?.reduce((s, o) => s + (o.votes || 0), 0) || 0;
  const hasVotedPoll = localPost.poll_options?.some(o => o.voted_by?.includes(userId));

  const timeAgo = localPost.created_date
    ? formatDistanceToNow(new Date(localPost.created_date), { addSuffix: true })
    : "";

  return (
    <>
      <div
        onClick={() => navigate(createPageUrl(`PostDetail?id=${localPost.id}`))}
        className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all duration-200 border border-slate-100 hover:border-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[13px] shadow-sm"
              style={{ backgroundColor: primaryLight }}>
              {getAliasEmoji(localPost.author_alias)}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 capitalize">{getCleanAlias(localPost.author_alias)}</p>
              <p className="text-[10px] text-slate-400 leading-tight whitespace-nowrap">{timeAgo}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {localPost.department && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium border"
                  style={{ backgroundColor: primaryLight, color: primary, borderColor: primaryLight }}>
                  {localPost.department}
                </span>
              )}
              {localPost.academic_level && localPost.academic_level !== "all" && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                  {localPost.academic_level}
                </span>
              )}
              {localPost.category && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${categoryColors[localPost.category] || categoryColors.general}`}>
                  {localPost.category}
                </span>
              )}
              {localPost.post_type === "poll" && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium flex items-center gap-1">
                  <BarChart2 className="w-[10px] h-[10px]" /> Poll
                </span>
              )}
            </div>

            {/* Owner menu */}
            {isOwner && !localPost.deleted && (
              <div className="relative ml-1" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setShowMenu(v => !v)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 w-32">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMenu(false); setShowEdit(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        {localPost.title && (
          <p className="font-semibold text-slate-900 text-[15px] mb-1 line-clamp-2">{localPost.title}</p>
        )}

        {/* Content */}
        {localPost.deleted ? (
          <p className="text-slate-400 italic text-sm leading-relaxed mb-3">[deleted]</p>
        ) : (
          <div className="mb-3">
            {localPost.content && <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">{localPost.content}</p>}
            {localPost.edited && <span className="text-xs text-slate-400 italic">edited</span>}
          </div>
        )}

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
                    hasVotedPoll ? (myVote ? "" : "border-slate-200 text-slate-600") : "border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                  style={myVote ? { borderColor: primary, color: primary } : {}}
                >
                  {hasVotedPoll && (
                    <div className={`absolute inset-0 rounded-xl ${!myVote ? "bg-slate-50" : ""}`} style={{ width: `${pct}%`, ...(myVote ? { backgroundColor: primaryLight } : {}) }} />
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

        {/* Event Details */}
        {localPost.category === "events" && localPost.event_date && !localPost.deleted && (
          <div className="flex items-center gap-3 text-xs text-slate-600 mb-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{localPost.event_date}</span>
            </div>
            {localPost.event_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{localPost.event_time}</span>
              </div>
            )}
            {localPost.event_location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{localPost.event_location}</span>
              </div>
            )}
          </div>
        )}

        {/* Image / GIF */}
        {!localPost.deleted && (
          <>
            {localPost.gif_url ? (
              <div className="mb-3 rounded-xl overflow-hidden bg-slate-100">
                <PlayableGif gifUrl={localPost.gif_url} stillUrl={localPost.still_url} className="w-full max-h-96" />
              </div>
            ) : localPost.image_url ? (
              <div className="mb-3 rounded-xl overflow-hidden">
                <img src={localPost.image_url} alt="" className="w-full max-h-64 object-cover" />
              </div>
            ) : null}
          </>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 pt-2 border-t border-slate-50">
          <button onClick={(e) => handleVote(e, "up")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${votedUp ? "bg-green-100 text-green-600" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}>
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

      {showEdit && (
        <EditPostModal
          post={localPost}
          onClose={() => setShowEdit(false)}
          onSaved={handleEditSaved}
          primaryColor={primary}
        />
      )}
    </>
  );
}