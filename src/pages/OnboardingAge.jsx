// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { AlertCircle, Lock, Calendar } from "lucide-react";

function calculateAge(dob) {
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

function get18thBirthday(dob) {
    const birth = new Date(dob);
    return new Date(birth.getFullYear() + 18, birth.getMonth(), birth.getDate());
}

function formatCountdown(targetDate) {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
}

export default function OnboardingAge() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [dob, setDob] = useState("");
    const [error, setError] = useState("");
    const [locked, setLocked] = useState(false);
    const [unlockDate, setUnlockDate] = useState(null);
    const [countdown, setCountdown] = useState(null);

    // Check if there's an existing unlock_at
    useEffect(() => {
        if (user?.unlock_at) {
            const unlockAt = new Date(user.unlock_at);
            if (unlockAt > new Date()) {
                setLocked(true);
                setUnlockDate(unlockAt);
            } else {
                // Unlock time has passed!
                updateUser({ age_verified: true, unlock_at: null });
                navigate("/OnboardingProfile", { replace: true });
            }
        }
    }, [user?.unlock_at]);

    // Countdown timer
    useEffect(() => {
        if (!locked || !unlockDate) return;
        const interval = setInterval(() => {
            const cd = formatCountdown(unlockDate);
            if (!cd) {
                clearInterval(interval);
                updateUser({ age_verified: true, unlock_at: null });
                navigate("/OnboardingProfile", { replace: true });
            } else {
                setCountdown(cd);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [locked, unlockDate]);

    const handleSubmit = () => {
        setError("");
        if (!dob) { setError("Please enter your date of birth."); return; }

        const age = calculateAge(dob);
        if (age >= 18) {
            updateUser({ age_verified: true, dob });
            navigate("/OnboardingProfile", { replace: true });
        } else {
            const eighteenthBday = get18thBirthday(dob);
            updateUser({ unlock_at: eighteenthBday.toISOString(), dob });
            setUnlockDate(eighteenthBday);
            setLocked(true);
        }
    };

    // Locked countdown view
    if (locked && countdown) {
        return (
            <div className="min-h-screen bg-[#F6F8FC] flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-sm text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-slate-400" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-1">You're not quite 18 yet</h2>
                    <p className="text-xs text-slate-400 mb-6">
                        Campus Echo is for students 18 and older. Come back on your birthday!
                    </p>

                    <div className="grid grid-cols-4 gap-2 mb-6">
                        {[
                            { value: countdown.days, label: "Days" },
                            { value: countdown.hours, label: "Hours" },
                            { value: countdown.minutes, label: "Min" },
                            { value: countdown.seconds, label: "Sec" },
                        ].map(({ value, label }) => (
                            <div key={label} className="bg-white rounded-xl border border-slate-100 py-3 px-2">
                                <p className="text-2xl font-bold text-slate-900 tabular-nums">{String(value).padStart(2, "0")}</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>

                    <p className="text-[11px] text-slate-400">
                        Unlocks on{" "}
                        <span className="font-semibold text-slate-600">
                            {unlockDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                    </p>
                </div>
            </div>
        );
    }

    // DOB entry view
    return (
        <div className="min-h-screen bg-[#F6F8FC] flex flex-col">
            <div className="px-4 pt-8 pb-2">
                <div className="max-w-sm mx-auto flex items-center gap-2">
                    <span className="text-lg">🦇</span>
                    <span className="text-sm font-bold text-slate-800 tracking-tight">echo</span>
                </div>
            </div>

            <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-12">
                <div className="w-full max-w-sm">
                    {/* Progress */}
                    <div className="flex gap-1 mb-6">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full ${i <= 4 ? "bg-slate-900" : "bg-slate-200"}`} />
                        ))}
                    </div>

                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-slate-900">Confirm your age</h2>
                        <p className="text-xs text-slate-400 mt-0.5">You must be 18 or older to join.</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-100 p-4">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Date of birth</label>
                        <div className="relative">
                            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="date"
                                value={dob}
                                onChange={e => { setDob(e.target.value); setError(""); }}
                                max={new Date().toISOString().split("T")[0]}
                                className="w-full pl-8 pr-3 py-2 text-[13px] text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 rounded-lg px-2.5 py-1.5 mt-2.5">
                                <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                                <p className="text-[11px] text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={!dob}
                            className="w-full mt-3 py-2 rounded-lg bg-slate-900 text-white text-[13px] font-medium hover:bg-slate-800 disabled:opacity-40 transition-all"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}