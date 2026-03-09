"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

const SCHOOLS = [
    { code: "ETHZ", name: "ETH Zürich", emoji: "🏛️", domains: "ethz.ch / student.ethz.ch" },
    { code: "UZH", name: "University of Zürich", emoji: "🎓", domains: "uzh.ch" },
    { code: "EPFL", name: "EPFL", emoji: "⚗️", domains: "epfl.ch" },
];

export default function OnboardingSchoolPage() {
    const { user, isLoadingAuth, refreshUser } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState<"school" | "send" | "verify">("school");
    const [selectedSchool, setSelectedSchool] = useState("");
    const [schoolEmail, setSchoolEmail] = useState("");
    const [verificationId, setVerificationId] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (!isLoadingAuth && !user) router.replace("/login");
        if (!isLoadingAuth && user?.school_verified) router.replace("/onboarding/age");
    }, [user, isLoadingAuth, router]);

    // Resend cooldown timer
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const sendCode = async () => {
        setError(""); setLoading(true);
        try {
            const res = await fetch("/api/auth/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ school_email: schoolEmail, school_code: selectedSchool }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setVerificationId(data.verification_id);
            setStep("verify");
            setCountdown(60);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    };

    const verifyCode = async () => {
        setError(""); setLoading(true);
        try {
            const res = await fetch("/api/auth/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ verification_id: verificationId, code }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            await refreshUser();
            router.push("/onboarding/age");
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🦇</div>
                    <h1 className="text-2xl font-black text-white">Verify your school</h1>
                    <p className="text-slate-400 text-sm mt-1">Campus Echo is for verified students only</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl space-y-5">
                    {/* Step 1 — Pick school */}
                    {step === "school" && (
                        <>
                            <p className="text-slate-300 text-sm font-medium">Select your university</p>
                            <div className="space-y-2">
                                {SCHOOLS.map((s) => (
                                    <button
                                        key={s.code}
                                        onClick={() => setSelectedSchool(s.code)}
                                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${selectedSchool === s.code
                                                ? "bg-blue-500/20 border-blue-400/50 text-white"
                                                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                                            }`}
                                    >
                                        <span className="text-xl">{s.emoji}</span>
                                        <div>
                                            <p className="text-sm font-semibold">{s.name}</p>
                                            <p className="text-xs text-slate-400">{s.domains}</p>
                                        </div>
                                        {selectedSchool === s.code && <span className="ml-auto text-blue-400">✓</span>}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">School email address</label>
                                <input
                                    type="email"
                                    value={schoolEmail}
                                    onChange={(e) => setSchoolEmail(e.target.value)}
                                    placeholder={selectedSchool === "ETHZ" ? "you@ethz.ch" : selectedSchool === "UZH" ? "you@uzh.ch" : "you@school.edu"}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                                />
                            </div>

                            {error && <p className="text-red-300 text-sm bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3">{error}</p>}

                            <button
                                onClick={sendCode}
                                disabled={!selectedSchool || !schoolEmail || loading}
                                className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-blue-500/30 active:scale-95"
                            >
                                {loading ? "Sending code…" : "Send Verification Code"}
                            </button>
                        </>
                    )}

                    {/* Step 2 — Enter code */}
                    {step === "verify" && (
                        <>
                            <div className="text-center">
                                <div className="text-3xl mb-2">📬</div>
                                <p className="text-white font-semibold">Check your school email</p>
                                <p className="text-slate-400 text-sm mt-1">We sent a 6-digit code to <span className="text-white font-medium">{schoolEmail}</span></p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">Verification code</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").substring(0, 6))}
                                    placeholder="123456"
                                    maxLength={6}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-2xl font-mono tracking-widest placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
                                />
                            </div>

                            {error && <p className="text-red-300 text-sm bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3">{error}</p>}

                            <button
                                onClick={verifyCode}
                                disabled={code.length < 6 || loading}
                                className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-blue-500/30 active:scale-95"
                            >
                                {loading ? "Verifying…" : "Verify Code"}
                            </button>

                            <button
                                onClick={() => { setStep("school"); setCode(""); setError(""); }}
                                className="w-full text-slate-400 hover:text-white text-sm py-2 transition-colors"
                            >
                                ← Use a different email
                            </button>

                            {countdown > 0 ? (
                                <p className="text-slate-500 text-xs text-center">Resend in {countdown}s</p>
                            ) : (
                                <button onClick={sendCode} className="w-full text-blue-400 hover:text-blue-300 text-sm py-1 transition-colors">
                                    Resend code
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
