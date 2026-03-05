import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, ArrowUp, ArrowDown, MessageCircle, Send, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import EditPostModal from "@/components/feed/EditPostModal";
import { formatDistanceToNow } from "date-fns";
import CommentItem from "@/components/post/CommentItem";
import { generateAlias } from "@/components/utils/aliases";

export default function PostDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [commentSort, setCommentSort] = useState("new");
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const fetchData = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const [postData, commentsData] = await Promise.all([
        base44.entities.Post.filter({ id: postId }),
        base44.entities.Comment.filter({ post_id: postId }, "created_date", 100)
      ]);
      setPost(postData[0] || null);
      setComments(commentsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [postId]);

  const handleVote = async (type) => {
    if (!post) return;
    const userId = currentUser?.id || "anon";
    const votedUp = post.voted_up_by?.includes(userId);
    const votedDown = post.voted_down_by?.includes(userId);
    let newVotedUp = [...(post.voted_up_by || [])];
    let newVotedDown = [...(post.voted_down_by || [])];
    let newUpvotes = post.upvotes || 0;
    let newDownvotes = post.downvotes || 0;

    if (type === "up") {
      if (votedUp) { newVotedUp = newVotedUp.filter(id => id !== userId); newUpvotes--; }
      else {
        newVotedUp.push(userId); newUpvotes++;
        if (votedDown) { newVotedDown = newVotedDown.filter(id => id !== userId); newDownvotes--; }
      }
    } else {
      if (votedDown) { newVotedDown = newVotedDown.filter(id => id !== userId); newDownvotes--; }
      else {
        newVotedDown.push(userId); newDownvotes++;
        if (votedUp) { newVotedUp = newVotedUp.filter(id => id !== userId); newUpvotes--; }
      }
    }

    const updated = { ...post, upvotes: newUpvotes, downvotes: newDownvotes, voted_up_by: newVotedUp, voted_down_by: newVotedDown };
    setPost(updated);
    await base44.entities.Post.update(post.id, { upvotes: newUpvotes, downvotes: newDownvotes, voted_up_by: newVotedUp, voted_down_by: newVotedDown });
  };

  const handleComment = async () => {
    if (!newComment.trim() || !post) return;
    setSubmitting(true);
    const seed = (currentUser?.id || "anon") + Date.now();
    const { alias, color } = generateAlias(seed);

    await base44.entities.Comment.create({
      post_id: post.id,
      content: newComment.trim(),
      author_alias: alias,
      author_color: color,
      upvotes: 0,
      voted_up_by: []
    });

    await base44.entities.Post.update(post.id, { comment_count: (post.comment_count || 0) + 1 });
    setNewComment("");
    setSubmitting(false);
    fetchData();
  };

  const topComments = comments
    .filter(c => !c.parent_comment_id)
    .sort((a, b) => commentSort === "best"
      ? (b.upvotes || 0) - (a.upvotes || 0)
      : new Date(b.created_date) - new Date(a.created_date)
    );
  const getReplies = (commentId) => comments.filter(c => c.parent_comment_id === commentId);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <p className="text-slate-500">Post not found</p>
        <button onClick={() => navigate(-1)} className="mt-3 text-violet-600 text-sm font-medium">Go back</button>
      </div>
    );
  }

  const userId = currentUser?.id || "anon";
  const isOwner = post.created_by === currentUser?.email;
  const votedUp = post.voted_up_by?.includes(userId);
  const votedDown = post.voted_down_by?.includes(userId);
  const timeAgo = post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : "";

  const handleDelete = async () => {
    await base44.entities.Post.update(post.id, { deleted: true });
    setPost({ ...post, deleted: true });
    setShowMenu(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-bold text-slate-900">Post</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4">
        {/* Post */}
        <div className="bg-white rounded-2xl p-5 mb-4 border border-slate-100">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
              style={{ backgroundColor: post.author_color || "#6C63FF" }}>
              {post.author_alias?.charAt(0) || "A"}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{post.author_alias || "Anonymous"}</p>
              <p className="text-xs text-slate-400">{timeAgo}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {post.category && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium capitalize">
                  {post.category}
                </span>
              )}
              {isOwner && !post.deleted && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(v => !v)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 w-32">
                      <button
                        onClick={() => { setShowMenu(false); setShowEdit(true); }}
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

          {post.title && <p className="font-semibold text-slate-900 text-[17px] mb-2">{post.title}</p>}
          {post.deleted ? (
            <p className="text-slate-400 italic text-[15px] mb-4">[deleted]</p>
          ) : (
            <p className="text-slate-800 text-[15px] leading-relaxed mb-4">{post.content}</p>
          )}

          {post.image_url && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img src={post.image_url} alt="" className="w-full object-cover" />
            </div>
          )}

          {/* Vote Bar */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => handleVote("up")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                votedUp ? "bg-violet-100 text-violet-600" : "text-slate-400 hover:bg-slate-50"
              }`}
            >
              <ArrowUp className="w-4 h-4" />
              {post.upvotes || 0}
            </button>
            <button
              onClick={() => handleVote("down")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                votedDown ? "bg-red-100 text-red-500" : "text-slate-400 hover:bg-slate-50"
              }`}
            >
              <ArrowDown className="w-4 h-4" />
              {post.downvotes || 0}
            </button>
            <span className="ml-auto flex items-center gap-1.5 text-sm text-slate-400">
              <MessageCircle className="w-4 h-4" />
              {comments.length} comments
            </span>
          </div>
        </div>

        {/* Comment Input */}
        <div className="bg-white rounded-2xl p-4 mb-4 border border-slate-100 flex gap-3 items-end">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment anonymously..."
            rows={2}
            className="flex-1 resize-none text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={handleComment}
            disabled={!newComment.trim() || submitting}
            className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-violet-700 transition-all flex-shrink-0"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Comments Header + Sort */}
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-sm font-bold text-slate-700">{comments.length} Comments</p>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {["best", "new"].map(s => (
              <button
                key={s}
                onClick={() => setCommentSort(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize ${
                  commentSort === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                {s === "best" ? "⭐ Best" : "🕐 New"}
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden">
          {topComments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-400 text-sm">No comments yet. Be first!</p>
            </div>
          ) : (
            topComments.map(comment => (
              <div key={comment.id} className="px-4">
                <CommentItem comment={comment} currentUser={currentUser} onReply={fetchData} depth={0} />
                {getReplies(comment.id).map(reply => (
                  <CommentItem key={reply.id} comment={reply} currentUser={currentUser} onReply={fetchData} depth={1} />
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>

      {showEdit && (
        <EditPostModal
          post={post}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); fetchData(); }}
        />
      )}
    </div>
  );
}