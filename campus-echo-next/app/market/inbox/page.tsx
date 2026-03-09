"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import NavBar from "@/components/NavBar";
import { market as marketApi } from "@/lib/apiClient";
import { ArrowLeft, Tag, MessageSquare } from "lucide-react";

interface Thread {
    id: string;
    listing_id: string;
    buyer_id: string;
    seller_id: string;
    status: string;
    updated_at: string;
    listing?: {
        id: string;
        title: string;
        price: number;
        is_free: boolean;
        images: { url: string; order_index: number }[];
    };
}

const timeAgo = (ts: string) => {
    const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (s < 60) return "now";
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
};

export default function MarketInboxPage() {
    const { user, isLoadingAuth } = useAuth();
    const router = useRouter();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [msgInput, setMsgInput] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!isLoadingAuth && !user) router.replace("/login");
    }, [user, isLoadingAuth, router]);

    useEffect(() => {
        if (!user) return;
        marketApi.getThreads().then((data: any) => {
            setThreads(data.threads ?? []);
        }).catch(console.error).finally(() => setLoading(false));
    }, [user]);

    const openThread = async (thread: Thread) => {
        setSelectedThread(thread);
        try {
            const data = (await marketApi.getMessages(thread.id)) as any;
            setMessages(data.messages ?? []);
        } catch { setMessages([]); }
    };

    const sendMessage = async () => {
        if (!msgInput.trim() || !selectedThread) return;
        setSending(true);
        try {
            const data = (await marketApi.sendMessage(selectedThread.id, msgInput.trim())) as any;
            setMessages((prev) => [...prev, data.message]);
            setMsgInput("");
        } catch (e) { console.error(e); }
        finally { setSending(false); }
    };

    if (selectedThread) {
        const listing = selectedThread.listing;
        const isSeller = selectedThread.seller_id === user?.id;
        return (
            <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F6F8FC" }}>
                <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-100">
                    <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
                        <button onClick={() => setSelectedThread(null)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{listing?.title ?? "Item"}</p>
                            <p className="text-xs text-slate-400">{isSeller ? "You're selling" : "You're buying"} · {listing?.is_free ? "Free" : `CHF ${listing?.price?.toFixed(2)}`}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 max-w-xl mx-auto w-full px-4 py-4 space-y-3 overflow-y-auto">
                    {messages.map((m) => {
                        const isMe = m.sender_id === user?.id;
                        return (
                            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-slate-900 text-white rounded-br-sm" : "bg-white border border-slate-100 text-slate-800 rounded-bl-sm"}`}>
                                    {m.content}
                                    <p className={`text-[10px] mt-1 ${isMe ? "text-slate-400" : "text-slate-400"}`}>{timeAgo(m.created_at)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="sticky bottom-0 bg-white border-t border-slate-100 p-3">
                    <div className="max-w-xl mx-auto flex gap-2">
                        <input type="text" value={msgInput} onChange={(e) => setMsgInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Message..." className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 border-0" />
                        <button onClick={sendMessage} disabled={!msgInput.trim() || sending} className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">Send</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#F6F8FC" }}>
            <NavBar />

            <div className="max-w-xl mx-auto px-4 py-4 space-y-3">
                {loading ? (
                    [1, 2, 3].map((i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-slate-100" />)
                ) : threads.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageSquare className="w-7 h-7 text-slate-300" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1">No messages yet</h3>
                        <p className="text-slate-500 text-sm">When you message a seller or receive an inquiry, it appears here.</p>
                        <Link href="/market" className="mt-4 inline-block bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all">Browse Market</Link>
                    </div>
                ) : (
                    threads.map((thread) => {
                        const listing = thread.listing;
                        const isSeller = thread.seller_id === user?.id;
                        const thumb = listing?.images?.[0]?.url;
                        return (
                            <div
                                key={thread.id}
                                onClick={() => openThread(thread)}
                                className="bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-md transition-all cursor-pointer flex gap-4 items-center"
                            >
                                <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                                    {thumb ? <img src={thumb} className="w-full h-full object-cover" alt="item" /> : <Tag className="w-6 h-6 text-slate-300" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-1">
                                        <h4 className="font-bold text-slate-900 truncate pr-2 text-sm">{listing?.title ?? "Loading..."}</h4>
                                        <span className="text-xs text-slate-400 shrink-0">{timeAgo(thread.updated_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className={`px-2 py-0.5 rounded font-bold ${isSeller ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-700"}`}>
                                            {isSeller ? "Selling" : "Buying"}
                                        </span>
                                        {listing && <span className="text-slate-500">{listing.is_free ? "Free" : `CHF ${listing.price?.toFixed(2)}`}</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
