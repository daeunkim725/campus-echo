import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, ArrowUp, ArrowDown, MessageCircle, Send, MoreHorizontal, Pencil, Trash2, BarChart2, Calendar, MapPin, Clock, Smile, X } from "lucide-react";
import EditPostModal from "@/components/feed/EditPostModal";
import { getSchoolConfig } from "@/components/utils/schoolConfig";
import GiphyBrowser from "@/components/feed/GiphyBrowser";
import { PlayableGif } from "@/components/ui/PlayableGif";

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
import { formatDistanceToNow } from "date-fns";
import CommentItem from "@/components/post/CommentItem";
import { getMoodEmoji, getCleanAlias } from "@/components/utils/moodUtils";

// Extract mood key from alias like "😴 sleepy" → "sleepy"
function getMoodFromAlias(alias) {
  if (!alias) return null;
  const clean = getCleanAlias(alias).trim().toLowerCase();
  return clean || null;
}

export default function PostDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [gifUrl, setGifUrl] = useState(null);
  const [stillUrl, setStillUrl] = useState(null);
  const [showGiphy, setShowGiphy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [commentSort, setCommentSort] = useState("new");
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const schoolConfig = getSchoolConfig(currentUser?.school);
  const primary = schoolConfig?.primary || "#7C3AED";
  const primaryLight = schoolConfig?.primaryLight || "#EDE9FE";

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
    if ((!newComment.trim() && !gifUrl) || !post) return;
    setSubmitting(true);
    
    const alias = currentUser?.mood ? `${getMoodEmoji(currentUser.mood)} ${currentUser.mood}` : "👤 anonymous";
    const color = primary;

    await base44.entities.Comment.create({
      post_id: post.id,
      content: newComment.trim(),
      gif_url: gifUrl,
      still_url: stillUrl,
      author_alias: alias,
      author_color: color,
      upvotes: 0,
      voted_up_by: []
    });

    await base44.entities.Post.update(post.id, { comment_count: (post.comment_count || 0) + 1 });
    setNewComment("");
    setGifUrl(null);
    setStillUrl(null);
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
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: primary, borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <p className="text-slate-500">Post not found</p>
        <button onClick={() => navigate(-1)} className="mt-3 text-sm font-medium" style={{ color: primary }}>Go back</button>
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

  const handlePollVote = async (optionIndex) => {
    if (!post.poll_options) return;
    const userId = currentUser?.id || "anon";
    const alreadyVoted = post.poll_options.some(o => o.voted_by?.includes(userId));
    if (alreadyVoted) return;

    const newOptions = post.poll_options.map((opt, i) => {
      if (i === optionIndex) return { ...opt, votes: (opt.votes || 0) + 1, voted_by: [...(opt.voted_by || []), userId] };
      return opt;
    });
    const updated = { ...post, poll_options: newOptions };
    setPost(updated);
    await base44.entities.Post.update(post.id, { poll_options: newOptions });
  };

  const totalPollVotes = post?.poll_options?.reduce((s, o) => s + (o.votes || 0), 0) || 0;
  const hasVotedPoll = post?.poll_options?.some(o => o.voted_by?.includes(currentUser?.id || "anon"));

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
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm shadow-sm"
              style={{ backgroundColor: primary }}>
              {Array.from(post.author_alias || "A")[0]}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 capitalize">{getCleanAlias(post.author_alias)}</p>
              <p className="text-[10px] text-slate-400 leading-tight whitespace-nowrap">{timeAgo}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
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

          {/* Poll Options */}
          {post.post_type === "poll" && post.poll_options && (
            <div className="space-y-2 mb-4">
              {post.poll_options.map((opt, i) => {
                const pct = totalPollVotes > 0 ? Math.round((opt.votes || 0) / totalPollVotes * 100) : 0;
                const myVote = opt.voted_by?.includes(userId);
                return (
                  <button
                    key={i}
                    onClick={() => handlePollVote(i)}
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

          {post.gif_url ? (
            <div className="mb-4 rounded-xl overflow-hidden bg-slate-100">
              <PlayableGif gifUrl={post.gif_url} stillUrl={post.still_url} className="w-full max-h-96" />
            </div>
          ) : post.image_url ? (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img src={post.image_url} alt="" className="w-full object-cover" />
            </div>
          ) : null}

          {/* Event Details */}
          {post.category === "events" && post.event_date && !post.deleted && (
            <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1.5 border border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{post.event_date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{post.event_time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{post.event_location}</span>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {post.department && (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium border"
                style={{ backgroundColor: primaryLight, color: primary, borderColor: primaryLight }}>
                {post.department}
              </span>
            )}
            {post.academic_level && post.academic_level !== "all" && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                {post.academic_level}
              </span>
            )}
            {post.category && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${categoryColors[post.category] || categoryColors.general}`}>
                {post.category}
              </span>
            )}
            {post.post_type === "poll" && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium flex items-center gap-1">
                <BarChart2 className="w-[10px] h-[10px]" /> Poll
              </span>
            )}
          </div>

          {/* Vote Bar */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => handleVote("up")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                votedUp ? "bg-green-100 text-green-600" : "text-slate-400 hover:bg-slate-50"
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
        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden mb-24">
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

      {showEdit && (
        <EditPostModal
          post={post}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); fetchData(); }}
          primaryColor={primary}
        />
      )}

      {/* Comment Input (Fixed to bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-3 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-xl mx-auto">
          {gifUrl && (
            <div className="relative inline-block mb-3 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
              <img src={stillUrl} alt="selected gif" className="h-32 object-cover" />
              <button onClick={() => {setGifUrl(null); setStillUrl(null);}} className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex gap-2 items-center relative">
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
            
            <button
              onClick={() => setShowGiphy(!showGiphy)}
              className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors flex-shrink-0"
            >
              <Smile className="w-5 h-5" />
            </button>
            
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment anonymously..."
              className="flex-1 bg-slate-100 text-[14px] text-slate-800 placeholder:text-slate-500 focus:outline-none px-4 py-3 rounded-full border border-slate-200 focus:bg-white transition-colors"
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              onFocus={(e) => e.target.style.borderColor = primary}
              onBlur={(e) => e.target.style.borderColor = ""}
            />
            <button
              onClick={handleComment}
              disabled={(!newComment.trim() && !gifUrl) || submitting}
              className="w-11 h-11 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-all flex-shrink-0 shadow-sm hover:opacity-90"
              style={{ backgroundColor: primary }}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}