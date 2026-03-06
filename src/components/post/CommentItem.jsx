import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, CornerDownRight, Send, Smile, X, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getMoodEmoji, getCleanAlias, getAliasEmoji } from "@/components/utils/moodUtils";
import { getSchoolConfig } from "@/components/utils/schoolConfig";
import { useThemeTokens } from "@/components/utils/ThemeProvider";
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
  const tokens = useThemeTokens(schoolConfig);
  const primary = tokens.primary;
  const primaryLight = tokens.primaryLight;
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

  const handleDelete = async () => {
    setShowMenu(false);
    await base44.entities.Comment.update(comment.id, { deleted: true });
    onReply?.();
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    setLoading(true);
    await base44.entities.Comment.update(comment.id, { content: editText.trim(), edited: true });
    setIsEditing(false);
    setLoading(false);
    onReply?.();
  };

  const timeAgo = comment.created_date
    ? formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })
    : "";

  return (
    <div className={depth > 0 ? "ml-8 pl-4" : ""} style={depth > 0 ? { borderLeftWidth: 2, borderLeftColor: tokens.divider } : {}}>
      <div className="flex gap-3 py-3">
        <div
          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm"
          style={{ backgroundColor: primary }}
        >
          {getAliasEmoji(comment.author_alias)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-semibold capitalize" style={{ color: tokens.text }}>{comment.author_alias}</span>
            <span className="text-xs" style={{ color: tokens.textMuted }}>{timeAgo}</span>
            {isOwner && !comment.deleted && (
              <div className="relative ml-auto">
                <button onClick={() => setShowMenu(!showMenu)} style={{ color: tokens.textMuted }}>
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-6 border rounded-xl shadow-lg z-20 py-1 w-32"
                    style={{ backgroundColor: tokens.surfaceElevated, borderColor: tokens.border }}>
                    <button onClick={() => { setShowMenu(false); setIsEditing(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                      style={{ color: tokens.text }}>
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {comment.deleted ? (
            <p className="text-[14px] italic leading-relaxed" style={{ color: tokens.textMuted }}>[deleted]</p>
          ) : isEditing ? (
            <div className="mt-2 flex flex-col gap-2">
              <input
                autoFocus
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleEdit()}
                className="w-full text-sm rounded-xl border px-3 py-2 focus:outline-none"
                style={{ borderColor: tokens.border, backgroundColor: tokens.surface, color: tokens.text }}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className="text-xs px-2 py-1" style={{ color: tokens.textMuted }}>Cancel</button>
                <button onClick={handleEdit} disabled={loading} className="text-xs text-white px-3 py-1 rounded-lg hover:opacity-90" style={{ backgroundColor: primary }}>Save</button>
              </div>
            </div>
          ) : (
            <>
              {comment.content && <p className="text-[14px] leading-relaxed" style={{ color: tokens.text }}>{comment.content} {comment.edited && <span className="text-[11px] italic ml-1" style={{ color: tokens.textMuted }}>(edited)</span>}</p>}
              {comment.gif_url && (
                <div className="mt-2 rounded-xl overflow-hidden max-w-[200px]" style={{ backgroundColor: tokens.divider }}>
                  <PlayableGif gifUrl={comment.gif_url} stillUrl={comment.still_url} className="w-full" />
                </div>
              )}
            </>
          )}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleUpvote}
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={votedUp ? { color: primary } : { color: tokens.textMuted }}
            >
              <ArrowUp className="w-3.5 h-3.5" />
              {localUpvotes}
            </button>
            {depth < 2 && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="flex items-center gap-1 text-xs font-medium transition-colors"
                style={{ color: tokens.textMuted }}
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                Reply
              </button>
            )}
          </div>

          {showReply && (
            <div className="mt-3 flex flex-col gap-2 relative">
              {gifUrl && (
                <div className="relative inline-block rounded-xl overflow-hidden border self-start"
                  style={{ backgroundColor: tokens.divider, borderColor: tokens.border }}>
                  <img src={stillUrl} alt="selected gif" className="h-24 object-cover" />
                  <button onClick={() => { setGifUrl(null); setStillUrl(null); }} className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70">
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
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                  style={{ backgroundColor: tokens.divider, color: tokens.textMuted }}
                >
                  <Smile className="w-4 h-4" />
                </button>
                <input
                  autoFocus
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleReply()}
                  placeholder="Write a reply..."
                  className="flex-1 text-sm rounded-xl border px-3 py-2 focus:outline-none"
                  style={{ borderColor: tokens.border, backgroundColor: tokens.surface, color: tokens.text }}
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