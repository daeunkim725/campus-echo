"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import NavBar from "@/components/NavBar";
import { feed as feedApi, votes as votesApi } from "@/lib/apiClient";
import { ArrowUp, ArrowDown, MessageCircle, MoreHorizontal, Repeat, Loader2 } from "lucide-react";

const categoryColors: Record<string, string> = {
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

interface Post {
    id: string;
    content: string;
    category: string;
    post_type: string;
    author_anon_id: string;
    author_handle?: string;
    author_mood?: string;
    upvotes: number;
    downvotes: number;
    comment_count: number;
    is_own_post: boolean;
    user_vote: number;
    created_at: string;
}

const timeAgo = (ts: string) => {
    const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (s < 60) return "now";
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
};

export default function FeedPage() {
    const { user, isLoadingAuth } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState("new");
    const [newContent, setNewContent] = useState("");
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (!isLoadingAuth && !user) router.replace("/login");
    }, [user, isLoadingAuth, router]);

    const fetchPosts = () => {
        if (!user) return;
        setLoading(true);
        feedApi.list({ sort }).then((data: any) => {
            setPosts(data.posts ?? []);
        }).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { fetchPosts(); }, [sort, user]);

    const handlePost = async () => {
        if (!newContent.trim()) return;
        setPosting(true);
        try {
            await feedApi.create({ content: newContent.trim(), category: "general" });
            setNewContent("");
            fetchPosts();
        } catch (e) { console.error(e); }
        finally { setPosting(false); }
    };

    const handleVote = async (postId: string, direction: "up" | "down") => {
        try {
            await votesApi.vote("post", postId, direction === "up" ? 1 : -1);
            fetchPosts();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: "#F6F8FC" }}>
            <NavBar />

            <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
                {/* Compose */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-100">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-blue-600">
                                {(user?.handle ?? "A").charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <textarea
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            placeholder="What's on your mind?"
                            rows={2}
                            className="flex-1 text-[13px] text-slate-800 placeholder:text-slate-300 resize-none border-0 focus:outline-none bg-transparent"
                        />
                    </div>
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={handlePost}
                            disabled={!newContent.trim() || posting}
                            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 transition-all flex items-center gap-1.5"
                        >
                            {posting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Post"}
                        </button>
                    </div>
                </div>

                {/* Sort tabs */}
                <div className="flex bg-white rounded-xl border border-slate-100 p-1">
                    {[
                        { id: "new", label: "New" },
                        { id: "hot", label: "Hot" },
                        { id: "top", label: "Top" },
                    ].map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setSort(s.id)}
                            className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all ${sort === s.id ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Posts */}
                {loading ? (
                    <div className="space-y-3">
                        {Array(4).fill(0).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200" />
                                    <div className="h-3 bg-slate-200 rounded w-24" />
                                </div>
                                <div className="h-3 bg-slate-200 rounded w-full" />
                                <div className="h-3 bg-slate-200 rounded w-3/4" />
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageCircle className="w-7 h-7 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">No posts yet</p>
                        <p className="text-slate-400 text-xs mt-1">Be the first to share something!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-white rounded-2xl p-3.5 cursor-pointer hover:shadow-md transition-all duration-200 border border-slate-100 hover:border-slate-200"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm bg-blue-50 text-blue-600">
                                            {(post.author_handle ?? post.author_anon_id ?? "A").charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-800">
                                                {post.is_own_post ? "You" : (post.author_handle ?? post.author_anon_id?.slice(0, 8))}
                                            </p>
                                            <p className="text-[10px] text-slate-400 leading-tight">{timeAgo(post.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {post.category && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${categoryColors[post.category] ?? categoryColors.general}`}>
                                                {post.category}
                                            </span>
                                        )}
                                        <button className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <p className="text-slate-800 text-[11px] leading-[16px] whitespace-pre-wrap mb-2">{post.content}</p>

                                {/* Actions */}
                                <div className="flex items-center gap-0.5 border-t border-slate-50 pt-1.5">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleVote(post.id, "up"); }}
                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-xs font-medium transition-all border ${post.user_vote === 1
                                                ? "bg-green-100 text-green-600 border-transparent"
                                                : "text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-600"
                                            }`}
                                    >
                                        <ArrowUp className="w-3.5 h-3.5" /><span>{post.upvotes ?? 0}</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleVote(post.id, "down"); }}
                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-xs font-medium transition-all border ${post.user_vote === -1
                                                ? "bg-red-100 text-red-500 border-transparent"
                                                : "text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-600"
                                            }`}
                                    >
                                        <ArrowDown className="w-3.5 h-3.5" /><span>{post.downvotes ?? 0}</span>
                                    </button>
                                    <button className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all ml-1">
                                        <Repeat className="w-3.5 h-3.5" /><span>0</span>
                                    </button>
                                    <button className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all ml-auto">
                                        <MessageCircle className="w-3.5 h-3.5" /><span>{post.comment_count ?? 0}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
