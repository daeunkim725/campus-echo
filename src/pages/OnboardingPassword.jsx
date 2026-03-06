import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { apiSignup } from "@/api/apiClient";
import { Lock, Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function getPasswordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
}

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["", "#ef4444", "#f59e0b", "#22c55e", "#16a34a"];

export default function OnboardingPassword() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [password, setPassword] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const strength = getPasswordStrength(password);
    const pwMatch = password && confirmPw && password === confirmPw;
    const pwMismatch = confirmPw && password !== confirmPw;

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setError("");
        if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
        if (!/[A-Z]/.test(password)) { setError("Include at least one uppercase letter."); return; }
        if (!/[0-9]/.test(password)) { setError("Include at least one number."); return; }
        if (password !== confirmPw) { setError("Passwords don't match."); return; }
        if (!acceptedTerms) { setError("You must accept the terms and conditions."); return; }

        setLoading(true);
        try {
            const email = user?.school_email || user?.email;
            await apiSignup(email, password);
            updateUser({ password_set: true });
            navigate("/OnboardingAge", { replace: true });
        } catch (err) {
            setError(err.message || "Failed to create account.");
        } finally {
            setLoading(false);
        }
    };

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
                            <div key={i} className={`h-1 flex-1 rounded-full ${i <= 3 ? "bg-slate-900" : "bg-slate-200"}`} />
                        ))}
                    </div>

                    <div className="mb-4">
                        <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-4.5 h-4.5 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-[11px] text-green-600 font-medium">Email verified</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Set your password</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Secure your account.</p>
                    </div>

                    <form onSubmit={handleCreateAccount}>
                        <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
                            {/* Password */}
                            <div>
                                <label className="block text-[11px] font-medium text-slate-500 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type={showPw ? "text" : "password"}
                                        value={password}
                                        onChange={e => { setPassword(e.target.value); setError(""); }}
                                        placeholder="Min 8 characters"
                                        className="w-full pl-8 pr-9 py-2 text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
                                    />
                                    <button type="button" onClick={() => setShowPw(!showPw)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>

                                {password && (
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <div className="flex-1 flex gap-0.5">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i}
                                                    className="h-1 rounded-full flex-1 transition-all"
                                                    style={{ backgroundColor: i <= strength ? strengthColors[strength] : "#e2e8f0" }}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-medium" style={{ color: strengthColors[strength] }}>
                                            {strengthLabels[strength]}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Confirm */}
                            <div>
                                <label className="block text-[11px] font-medium text-slate-500 mb-1">Confirm password</label>
                                <div className="relative">
                                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type={showPw ? "text" : "password"}
                                        value={confirmPw}
                                        onChange={e => { setConfirmPw(e.target.value); setError(""); }}
                                        placeholder="Re-enter password"
                                        className={`w-full pl-8 pr-9 py-2 text-[13px] text-slate-800 placeholder:text-slate-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all ${pwMismatch ? "border-red-300" : pwMatch ? "border-green-300" : "border-slate-200"}`}
                                    />
                                    {pwMatch && <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-green-500" />}
                                </div>
                                {pwMismatch && <p className="text-[10px] text-red-500 mt-0.5">Passwords don't match</p>}
                            </div>

                            {/* Requirements */}
                            <div className="pt-1 space-y-0.5">
                                {[
                                    { ok: password.length >= 8, label: "At least 8 characters" },
                                    { ok: /[A-Z]/.test(password), label: "One uppercase letter" },
                                    { ok: /[0-9]/.test(password), label: "One number" },
                                ].map((req, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                        <div className={`w-3 h-3 rounded-full flex items-center justify-center ${req.ok ? "bg-green-100" : "bg-slate-100"}`}>
                                            {req.ok && <Check className="w-2 h-2 text-green-600" />}
                                        </div>
                                        <span className={`text-[10px] ${req.ok ? "text-green-600" : "text-slate-400"}`}>{req.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-3">
                                <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                                <p className="text-[12px] text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="flex items-center gap-2 mt-4 px-1">
                            <Checkbox 
                                id="terms" 
                                checked={acceptedTerms}
                                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                            />
                            <Label htmlFor="terms" className="text-xs text-slate-500 font-medium cursor-pointer">
                                I accept the terms and conditions
                            </Label>
                        </div>

                        <button
                            type="submit"
                            disabled={!password || !confirmPw || password !== confirmPw || !acceptedTerms || loading}
                            className="w-full mt-4 py-2 rounded-lg bg-slate-900 text-white text-[13px] font-medium hover:bg-slate-800 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                        >
                            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create account"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}