import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, CornerDownRight, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { generateAlias } from "@/components/utils/aliases";

export default function CommentItem({ comment, currentUser, onReply, depth = 0 }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(comment.upvotes || 0);
  const [localVotedBy, setLocalVotedBy] = useState(comment.voted_up_by || []);

  const userId = currentUser?.id || "anon";
  const votedUp = localVotedBy.includes(userId);

  const handleUpvote = async () => {
    if (loading) return;
    setLoading(true);
    let newVoted = [...localVotedBy];
    let newCount = localUpvotes;
    if (votedUp) {
      newVoted = newVoted.filter(id => id !== userId);
      newCount--;
    } else {
      newVoted.push(userId);
      newCount++;
    }
    setLocalUpvotes(newCount);
    setLocalVotedBy(newVoted);
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
    <div className={depth > 0 ? "ml-8 border-l-2 border-gray-100 pl-4" : ""}>
      <div className="flex gap-3 py-3.5">
        <div
          className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-semibold mt-0.5"
          style={{ backgroundColor: comment.author_color || "#999" }}
        >
          {comment.author_alias?.charAt(0) || "A"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[13px] font-medium text-gray-800">{comment.author_alias}</span>
            <span className="text-[11px] text-gray-400">{timeAgo}</span>
          </div>
          <p className="text-[13px] text-gray-700 leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-1 text-[12px] transition-colors ${
                votedUp ? "text-[#E8344E] font-medium" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              {localUpvotes > 0 && <span>{localUpvotes}</span>}
            </button>
            {depth < 2 && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
              >
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
                className="flex-1 text-[13px] border-b border-gray-200 pb-1 focus:outline-none focus:border-[#E8344E] transition-colors placeholder:text-gray-400 bg-transparent"
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim() || loading}
                className="text-[#E8344E] disabled:opacity-40 transition-opacity"
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