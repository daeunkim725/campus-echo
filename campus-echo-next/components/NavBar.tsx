"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Plus, Bell, MessageSquare, LogOut, User } from "lucide-react";

const NAV_ITEMS = [
    { href: "/feed", label: "Feed", page: "feed" },
    { href: "/events", label: "Events", page: "events" },
    { href: "/market", label: "Market", page: "market" },
    { href: "/leaderboard", label: "Stats", page: "leaderboard" },
];

interface NavBarProps {
    onCreatePost?: () => void;
    createLabel?: string;
}

export default function NavBar({ onCreatePost, createLabel = "Post" }: NavBarProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const activePage = NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.page ?? "feed";
    const school = user?.school_id ?? "ETHZ";

    return (
        <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-xl mx-auto px-4 py-3.5">
                <div className="flex items-center justify-between">
                    {/* Left: profile + school */}
                    <div className="flex items-center gap-2.5">
                        <Link
                            href="/notifications"
                            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-transform active:scale-95 bg-blue-50"
                            title="Profile"
                        >
                            <User className="w-4 h-4 text-blue-600" />
                        </Link>
                        <div>
                            <h1 className="text-sm font-black text-slate-900 tracking-tight">{school === "ETHZ" ? "ETH Zürich" : school === "UZH" ? "UZH" : school}</h1>
                            <p className="text-[10px] text-slate-400 font-medium">@{user?.handle ?? "anonymous"}</p>
                        </div>
                    </div>

                    {/* Right: nav tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.page}
                                href={item.href}
                                className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${activePage === item.page
                                        ? "bg-white shadow-sm text-slate-900"
                                        : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Action row */}
                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-50">
                    <div className="flex items-center gap-1.5">
                        <Link
                            href="/notifications"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors relative"
                        >
                            <Bell className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/market/inbox"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <MessageSquare className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        {onCreatePost && (
                            <button
                                onClick={onCreatePost}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" /> {createLabel}
                            </button>
                        )}
                        <button
                            onClick={() => logout()}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Sign out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
