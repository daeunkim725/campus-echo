import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, ThumbsUp, MessageSquare, Send } from "lucide-react";
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

  const handleVote = async () => {
    if (!post) return;
    const userId = currentUser?.id || "anon";
    const votedUp = post.voted_up_by?.includes(userId);
    let newVotedUp = [...(post.voted_up_by || [])];
    let newUpvotes = post.upvotes || 0;
    if (votedUp) { newVotedUp = newVotedUp.filter(id => id !== userId); newUpvotes--; }
    else { newVotedUp.push(userId); newUpvotes++; }
    setPost({ ...post, upvotes: newUpvotes, voted_up_by: newVotedUp });
    await base44.entities.Post.update(post.id, { upvotes: newUpvotes, voted_up_by: newVotedUp });
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

  const topComments = comments.filter(c => !c.parent_comment_id);
  const getReplies = (commentId) => comments.filter(c => c.parent_comment_id === commentId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8]">
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 h-12 flex items-center px-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 flex items-center gap-1.5 text-[13px]">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <div className="max-w-2xl mx-auto mt-2">
          <div className="bg-white rounded-sm shadow-sm animate-pulse p-6 space-y-3">
            <div className="h-4 bg-gray-100 rounded w-1/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex flex-col items-center justify-center">
        <p className="text-gray-500 text-sm">Post not found</p>
        <button onClick={() => navigate(-1)} className="mt-2 text-[#E8344E] text-sm hover:underline">Go back</button>
      </div>
    );
  }

  const userId = currentUser?.id || "anon";
  const votedUp = post.voted_up_by?.includes(userId);
  const timeAgo = post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : "";

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors text-[13px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          {post.category && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-[13px] text-[#E8344E] font-medium">#{post.category}</span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-2 space-y-2 pb-8">
        {/* Post body */}
        <div className="bg-white rounded-sm shadow-sm px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold"
              style={{ backgroundColor: post.author_color || "#E8344E" }}
            >
              {post.author_alias?.charAt(0) || "A"}
            </div>
            <span className="text-[13px] font-medium text-gray-800">{post.author_alias}</span>
            <span className="text-[12px] text-gray-400 ml-auto">{timeAgo}</span>
          </div>

          <p className="text-[15px] text-gray-800 leading-relaxed mb-4">{post.content}</p>

          {post.image_url && (
            <div className="mb-4 rounded overflow-hidden">
              <img src={post.image_url} alt="" className="w-full object-cover" />
            </div>
          )}

          <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
            <button
              onClick={handleVote}
              className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors ${
                votedUp ? "text-[#E8344E]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{post.upvotes || 0}</span>
            </button>
            <span className="flex items-center gap-1.5 text-[13px] text-gray-400">
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length}</span>
            </span>
          </div>
        </div>

        {/* Comments section */}
        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-100">
            <span className="text-[13px] font-semibold text-gray-700">Comments · {comments.length}</span>
          </div>

          {/* Comment input */}
          <div className="px-6 py-4 border-b border-gray-100 flex gap-3 items-start">
            <div
              className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[11px] font-semibold mt-0.5"
              style={{ backgroundColor: "#aaa" }}
            >
              A
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleComment())}
                placeholder="Write a comment anonymously..."
                rows={2}
                className="w-full resize-none text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none leading-relaxed"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleComment}
                  disabled={!newComment.trim() || submitting}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#E8344E] text-white text-[12px] font-medium hover:bg-[#d02d43] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                  Comment
                </button>
              </div>
            </div>
          </div>

          {/* Comment list */}
          {topComments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-[13px]">No comments yet.</p>
            </div>
          ) : (
            <div>
              {topComments.map(comment => (
                <div key={comment.id} className="border-b border-gray-50 last:border-0">
                  <div className="px-6">
                    <CommentItem comment={comment} currentUser={currentUser} onReply={fetchData} depth={0} />
                    {getReplies(comment.id).map(reply => (
                      <CommentItem key={reply.id} comment={reply} currentUser={currentUser} onReply={fetchData} depth={1} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}