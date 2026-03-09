"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function OnboardingAgePage() {
    const { user, isLoadingAuth, refreshUser } = useAuth();
    const router = useRouter();
    const [dob, setDob] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isLoadingAuth && !user) router.replace("/login");
        if (!isLoadingAuth && user?.age_verified) router.replace("/feed");
    }, [user, isLoadingAuth, router]);

    const submit = async () => {
        if (!dob) { setError("Please enter your date of birth"); return; }
        setError(""); setLoading(true);
        try {
            const res = await fetch("/api/onboarding/age", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ dob }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            await refreshUser();

            if (data.age_verified) {
                router.push("/feed");
            } else {
                const unlockDate = data.unlock_at ? new Date(data.unlock_at).toLocaleDateString() : "your 18th birthday";
                setError(`You need to be 18+ to use Campus Echo. Access unlocks on ${unlockDate}.`);
            }
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    };

    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate()).toISOString().split("T")[0];
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()).toISOString().split("T")[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🎂</div>
                    <h1 className="text-2xl font-black text-white">Age Verification</h1>
                    <p className="text-slate-400 text-sm mt-1">You must be 18+ to access Campus Echo</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl space-y-5">
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Date of birth</label>
                        <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            min={minDate}
                            max={maxDate}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
                    )}

                    <button
                        onClick={submit}
                        disabled={!dob || loading}
                        className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-blue-500/30 active:scale-95"
                    >
                        {loading ? "Verifying…" : "Continue"}
                    </button>

                    <p className="text-slate-500 text-xs text-center">
                        Your date of birth is used only for age verification and is not stored publicly.
                    </p>
                </div>
            </div>
        </div>
    );
}
