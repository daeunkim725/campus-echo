import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, CornerDownRight, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { generateAlias } from "@/components/utils/aliases";

export default function CommentItem({ comment, currentUser, onReply, depth = 0 }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(comment.upvotes || 0);

  const userId = currentUser?.id || "anon";
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
    if (!replyText.trim()) return;
    setLoading(true);
    const seed = userId + Date.now();
    const { alias, color } = generateAlias(seed);
    await base44.entities.Comment.create({
      post_id: comment.post_id,
      parent_comment_id: comment.id,
      content: replyText.trim(),
      author_alias: alias,
      author_color: color,
      upvotes: 0,
      voted_up_by: []
    });
    setReplyText("");
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
          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: comment.author_color || "#6C63FF" }}
        >
          {comment.author_alias?.charAt(0) || "A"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-800">{comment.author_alias}</span>
            <span className="text-xs text-slate-400">{timeAgo}</span>
          </div>
          <p className="text-[14px] text-slate-700 leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                votedUp ? "text-violet-600" : "text-slate-400 hover:text-slate-600"
              }`}
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
            <div className="mt-3 flex gap-2">
              <input
                autoFocus
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleReply()}
                placeholder="Write a reply..."
                className="flex-1 text-sm rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100"
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim() || loading}
                className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white disabled:opacity-40 transition-all hover:bg-violet-700 self-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}