import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

const ACCESSORIES = [
    { id: "none", label: "Plain Bat", emoji: "🦇" },
    { id: "tophat", label: "Top Hat", emoji: "🎩" },
    { id: "sunglasses", label: "Sunglasses", emoji: "🕶️" },
    { id: "scarf", label: "Scarf", emoji: "🧣" },
    { id: "headphones", label: "Headphones", emoji: "🎧" },
    { id: "crown", label: "Crown", emoji: "👑" },
    { id: "flower", label: "Flower", emoji: "🌸" },
    { id: "star", label: "Star", emoji: "⭐" },
    { id: "lightning", label: "Lightning", emoji: "⚡" },
];

export default function OnboardingProfile() {
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const [selectedAccessory, setSelectedAccessory] = useState("none");

    const handleFinish = () => {
        updateUser({
            profile_complete: true,
            accessory: selectedAccessory,
        });
        // Navigate to main app, replacing entire history stack
        window.location.replace("/");
    };

    const selected = ACCESSORIES.find(a => a.id === selectedAccessory);

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
                            <div key={i} className="h-1 flex-1 rounded-full bg-slate-900" />
                        ))}
                    </div>

                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-slate-900">Create your profile</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Pick an accessory for your bat avatar.</p>
                    </div>

                    {/* Avatar preview */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center mb-5">
                        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-3 shadow-sm">
                            <span className="text-4xl">🦇</span>
                            {selected && selected.id !== "none" && (
                                <span className="absolute -top-2 -right-2 text-2xl drop-shadow-sm">{selected.emoji}</span>
                            )}
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                            {selected?.label || "Plain Bat"}
                        </p>
                        <p className="text-[10px] text-slate-400">Your anonymous identity</p>
                    </div>

                    {/* Accessory grid */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {ACCESSORIES.map(acc => (
                            <button
                                key={acc.id}
                                onClick={() => setSelectedAccessory(acc.id)}
                                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all ${selectedAccessory === acc.id
                                        ? "border-slate-900 bg-slate-50 shadow-sm"
                                        : "border-slate-100 bg-white hover:border-slate-200"
                                    }`}
                            >
                                <span className="text-2xl">{acc.emoji}</span>
                                <span className="text-[10px] font-medium text-slate-600">{acc.label}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleFinish}
                        className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-[13px] font-medium hover:bg-slate-800 transition-all"
                    >
                        Enter Campus Echo
                    </button>
                </div>
            </div>
        </div>
    );
}