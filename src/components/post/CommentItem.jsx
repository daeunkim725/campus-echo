import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, CornerDownRight, Send, Smile, X, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getMoodEmoji, getCleanAlias } from "@/components/utils/moodUtils";
import { getSchoolConfig } from "@/components/utils/schoolConfig";
import GiphyBrowser from "@/components/feed/GiphyBrowser";
import { PlayableGif } from "@/components/ui/PlayableGif";

export default function CommentItem({ comment, currentUser, onReply, depth = 0 }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [gifUrl, setGifUrl] = useState(null);
  const [stillUrl, setStillUrl] = useState(null);
  const [showGiphy, setShowGiphy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(comment.upvotes || 0);

  const userId = currentUser?.id || "anon";
  const isOwner = currentUser && comment.created_by === currentUser.email;
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content || "");
  const schoolConfig = getSchoolConfig(currentUser?.school);
  const primary = schoolConfig?.primary || "#7C3AED";
  const primaryLight = schoolConfig?.primaryLight || "#EDE9FE";
  const votedUp = comment.voted_up_by?.includes(userId);

  const handleUpvote = async () => {
    if (loading) return;
    setLoading(true);
    let newVoted = [...(comment.voted_up_by || [])];
    let newCount = localUpvotes;
    if (votedUp) {
      newVoted = newVoted.filter(id => id !== userId);
      newCount--;
    } else {
      newVoted.push(userId);
      newCount++;
    }
    setLocalUpvotes(newCount);
    await base44.entities.Comment.update(comment.id, { upvotes: newCount, voted_up_by: newVoted });
    setLoading(false);
  };

  const handleReply = async () => {
    if (!replyText.trim() && !gifUrl) return;
    setLoading(true);
    
    const alias = currentUser?.mood ? `${getMoodEmoji(currentUser.mood)} ${currentUser.mood}` : "👤 anonymous";
    const color = primary;

    await base44.entities.Comment.create({
      post_id: comment.post_id,
      parent_comment_id: comment.id,
      content: replyText.trim(),
      gif_url: gifUrl,
      still_url: stillUrl,
      author_alias: alias,
      author_color: color,
      upvotes: 0,
      voted_up_by: []
    });
    setReplyText("");
    setGifUrl(null);
    setStillUrl(null);
    setShowReply(false);
    setLoading(false);
    onReply?.();
  };

  const timeAgo = comment.created_date
    ? formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })
    : "";

  return (
    <div className={depth > 0 ? "ml-8 border-l-2 border-slate-100 pl-4" : ""}>
      <div className="flex gap-3 py-3">
        <div
          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm"
          style={{ backgroundColor: primary }}
        >
          {Array.from(comment.author_alias || "A")[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-800 capitalize">{comment.author_alias}</span>
            <span className="text-xs text-slate-400">{timeAgo}</span>
          </div>
          {comment.content && <p className="text-[14px] text-slate-700 leading-relaxed">{comment.content}</p>}
          {comment.gif_url && (
            <div className="mt-2 rounded-xl overflow-hidden bg-slate-100 max-w-[200px]">
              <PlayableGif gifUrl={comment.gif_url} stillUrl={comment.still_url} className="w-full" />
            </div>
          )}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                votedUp ? "" : "text-slate-400 hover:text-slate-600"
              }`}
              style={votedUp ? { color: primary } : {}}
            >
              <ArrowUp className="w-3.5 h-3.5" />
              {localUpvotes}
            </button>
            {depth < 2 && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                Reply
              </button>
            )}
          </div>

          {showReply && (
            <div className="mt-3 flex flex-col gap-2 relative">
              {gifUrl && (
                <div className="relative inline-block bg-slate-100 rounded-xl overflow-hidden border border-slate-200 self-start">
                  <img src={stillUrl} alt="selected gif" className="h-24 object-cover" />
                  <button onClick={() => {setGifUrl(null); setStillUrl(null);}} className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {showGiphy && (
                <GiphyBrowser 
                  onSelect={(gif) => {
                    setGifUrl(gif.gif_url);
                    setStillUrl(gif.still_url);
                    setShowGiphy(false);
                  }} 
                  onClose={() => setShowGiphy(false)} 
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowGiphy(!showGiphy)}
                  className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors flex-shrink-0"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <input
                  autoFocus
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleReply()}
                  placeholder="Write a reply..."
                  className="flex-1 text-sm rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-100"
                />
                <button
                  onClick={handleReply}
                  disabled={(!replyText.trim() && !gifUrl) || loading}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all hover:opacity-90 self-center flex-shrink-0"
                  style={{ backgroundColor: primary }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}