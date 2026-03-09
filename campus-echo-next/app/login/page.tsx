"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Mail, Lock, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const { user, login, isLoadingAuth } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isLoadingAuth && user) router.replace("/feed");
    }, [user, isLoadingAuth, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F6F8FC" }}>
            {/* Header */}
            <div className="px-4 pt-8 pb-2">
                <div className="max-w-sm mx-auto flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 tracking-tight">echo</span>
                </div>
            </div>

            <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-12">
                <div className="w-full max-w-sm">
                    {/* Heading */}
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-slate-900">Welcome back</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Listen in to your campus.</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
                            {/* Email */}
                            <div>
                                <label className="block text-[11px] font-medium text-slate-500 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                        placeholder="you@school.ch"
                                        className="w-full pl-8 pr-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-[11px] font-medium text-slate-500 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type={showPw ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                        placeholder="••••••••"
                                        className="w-full pl-8 pr-9 py-2 text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
                                    />
                                    <button type="button" onClick={() => setShowPw(!showPw)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-3">
                                <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                                <p className="text-[12px] text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!email || !password || loading}
                            className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                        >
                            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Log in"}
                        </button>
                    </form>

                    {/* Sign up link */}
                    <p className="text-center text-[11px] text-slate-400 mt-5">
                        New here?{" "}
                        <Link href="/signup" className="text-slate-700 font-medium hover:underline">
                            Join your campus
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
