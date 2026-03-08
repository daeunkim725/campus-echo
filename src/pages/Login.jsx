import React, { useState } from "react";
import { Link } from "react-router-dom";
import { apiLogin } from "@/api/apiClient";
import { Mail, Lock, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

const ADMIN_EMAILS = ["admin@admin.com", "daeunkim725@gmail.com", "daeunkim@gmail.com", "daeun.kim725@gmail.com"];

function isAdminEmail(email) {
    const lower = email.toLowerCase();
    return lower.endsWith("@campusecho.app") || ADMIN_EMAILS.includes(lower);
}

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isAdminEmail(email)) {
                // Client-side admin bypass
                const adminUser = {
                    id: "admin_" + Date.now(),
                    email: email.toLowerCase(),
                    displayName: email.split("@")[0],
                    is_verified_student: true,
                    school_id: "ETH",
                    school: "ETH",
                    school_verified: true,
                    email_verified: true,
                    password_set: true,
                    age_verified: true,
                    profile_complete: true,
                    role: "admin",
                    verified_at: new Date().toISOString(),
                };
                const fakeToken = btoa(JSON.stringify({ sub: adminUser.id, email: adminUser.email, role: "admin", exp: Date.now() + 86400000 }));
                localStorage.setItem("campus_echo_token", fakeToken);
                localStorage.setItem("campus_echo_user", JSON.stringify(adminUser));
                window.location.replace("/");
                return;
            }
            await apiLogin(email, password);
            window.location.replace("/");
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F8FC] flex flex-col">
            {/* Header */}
            <div className="px-4 pt-8 pb-2">
                <div className="max-w-sm mx-auto flex items-center gap-2">
                    <span className="text-lg">🦇</span>
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
                                        onChange={e => { setEmail(e.target.value); setError(""); }}
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
                                        onChange={e => { setPassword(e.target.value); setError(""); }}
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
                        <Link to="/onboarding/school" className="text-slate-700 font-medium hover:underline">
                            Join your campus
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
