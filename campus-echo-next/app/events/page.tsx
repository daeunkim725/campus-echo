"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import NavBar from "@/components/NavBar";
import { feed as feedApi } from "@/lib/apiClient";
import { Calendar, MapPin, Clock, Filter, List as ListIcon, Loader2 } from "lucide-react";

interface Post {
    id: string;
    content: string;
    event_date?: string;
    event_location?: string;
    event_type?: string;
    created_at: string;
}

const timeAgo = (ts: string) => {
    const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (s < 60) return "now";
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
};

export default function EventsPage() {
    const { user, isLoadingAuth } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newContent, setNewContent] = useState("");
    const [newDate, setNewDate] = useState("");
    const [newLocation, setNewLocation] = useState("");
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (!isLoadingAuth && !user) router.replace("/login");
    }, [user, isLoadingAuth, router]);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        feedApi.list({ category: "events" })
            .then((data: any) => setPosts(data.posts ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const handlePost = async () => {
        if (!newContent.trim()) return;
        setPosting(true);
        try {
            await feedApi.create({ content: newContent.trim(), category: "events" });
            setNewContent(""); setNewDate(""); setNewLocation("");
            setShowCreate(false);
            feedApi.list({ category: "events" }).then((data: any) => setPosts(data.posts ?? []));
        } catch (e) { console.error(e); }
        finally { setPosting(false); }
    };

    const groupedPosts = posts.reduce<Record<string, Post[]>>((acc, p) => {
        const month = new Date(p.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
        if (!acc[month]) acc[month] = [];
        acc[month].push(p);
        return acc;
    }, {});

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#F6F8FC" }}>
            <NavBar onCreatePost={() => setShowCreate(true)} createLabel="Event" />

            <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 animate-pulse space-y-3">
                            <div className="h-3 bg-slate-200 rounded w-2/3" />
                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                        </div>
                    ))
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Calendar className="w-7 h-7 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">No events yet</p>
                        <p className="text-slate-400 text-xs mt-1">Be the first to post an event!</p>
                        <button onClick={() => setShowCreate(true)} className="mt-4 bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all">Post an event</button>
                    </div>
                ) : (
                    Object.entries(groupedPosts).map(([month, group]) => (
                        <div key={month}>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">{month}</h3>
                            <div className="space-y-3">
                                {group.map((post) => (
                                    <div key={post.id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-all">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex flex-col items-center justify-center shrink-0">
                                                {post.event_date ? (
                                                    <>
                                                        <span className="text-[8px] font-bold text-indigo-400 uppercase leading-none">
                                                            {new Date(post.event_date).toLocaleDateString("en-US", { month: "short" })}
                                                        </span>
                                                        <span className="text-base font-black text-indigo-600 leading-none">
                                                            {new Date(post.event_date).getDate()}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <Calendar className="w-5 h-5 text-indigo-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-semibold text-slate-800 leading-[16px] whitespace-pre-wrap">{post.content}</p>
                                                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 flex-wrap">
                                                    {post.event_location && (
                                                        <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /><span>{post.event_location}</span></div>
                                                    )}
                                                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>{timeAgo(post.created_at)}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowCreate(false)}>
                    <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl animate-zoom-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Post an event</h2>
                            <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-500">×</button>
                        </div>
                        <div className="p-5 space-y-4">
                            <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Describe your event..." rows={4} className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-200 outline-none resize-none" />
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date & Time</label>
                                    <input type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full bg-slate-50 border-0 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-slate-200 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Location</label>
                                    <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="e.g. HG Building" className="w-full bg-slate-50 border-0 rounded-xl px-3 py-2.5 text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-slate-200 outline-none" />
                                </div>
                            </div>
                            <button onClick={handlePost} disabled={!newContent.trim() || posting} className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5">
                                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Event"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
