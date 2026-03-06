import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiSignup, apiLogin } from "@/api/apiClient";
import { GraduationCap, Mail, Lock, User, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Login() {
    const [mode, setMode] = useState("login"); // "login" | "signup"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (mode === "signup") {
                await apiSignup(email, password, displayName);
            } else {
                await apiLogin(email, password);
            }
            // On success, navigate to home (AuthContext will redirect to Onboarding if not verified)
            navigate("/");
            window.location.reload();
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100 flex flex-col">
            {/* Header */}
            <div className="px-4 py-6">
                <div className="max-w-md mx-auto flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shadow-violet-200">
                        <span className="text-white font-black text-sm">CE</span>
                    </div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Campus Echo</h1>
                </div>
            </div>

            <div className="flex-1 flex items-start justify-center px-4 py-6">
                <div className="w-full max-w-md">
                    {/* Icon + heading */}
                    <div className="mb-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
                            <GraduationCap className="w-8 h-8 text-violet-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">
                            {mode === "login" ? "Welcome back" : "Create your account"}
                        </h2>
                        <p className="text-slate-500 text-sm">
                            {mode === "login"
                                ? "Log in to your campus community"
                                : "Join your university's anonymous community"}
                        </p>
                    </div>

                    {/* Tab switcher */}
                    <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                        <button
                            onClick={() => { setMode("login"); setError(""); }}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === "login"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => { setMode("signup"); setError(""); }}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === "signup"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                            {/* Display name (signup only) */}
                            {mode === "signup" && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Display Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="How should we call you?"
                                            className="w-full pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                        placeholder={mode === "signup" ? "Min 8 chars, 1 uppercase, 1 number" : "Enter your password"}
                                        required
                                        className="w-full pl-10 pr-12 py-3 text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {mode === "signup" && (
                                    <p className="text-xs text-slate-400 mt-1.5">
                                        Must be at least 8 characters with 1 uppercase letter and 1 number
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                                <p className="text-red-600 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!email || !password || loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 disabled:opacity-40 transition-all shadow-md shadow-violet-200"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <ArrowRight className="w-4 h-4" />
                                    {mode === "login" ? "Log In" : "Create Account"}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-xs text-slate-400 mt-6">
                        {mode === "login" ? (
                            <>Don't have an account?{" "}
                                <button onClick={() => { setMode("signup"); setError(""); }} className="text-violet-600 font-medium hover:underline">
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>Already have an account?{" "}
                                <button onClick={() => { setMode("login"); setError(""); }} className="text-violet-600 font-medium hover:underline">
                                    Log in
                                </button>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
