import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { apiSendVerificationCode, apiVerifyCode } from "@/api/apiClient";
import { Mail, Loader2, ChevronLeft, AlertCircle } from "lucide-react";

const SCHOOL_DOMAINS = {
    ETH: ["@ethz.ch", "@student.ethz.ch"],
    UNIZH: ["@uzh.ch", "@student.uzh.ch"],
};

export default function OnboardingVerify() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [step, setStep] = useState("email"); // "email" | "code"
    const [schoolEmail, setSchoolEmail] = useState("");
    const [verificationId, setVerificationId] = useState(null);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const schoolCode = user?.school_id || "ETH";
    const domains = SCHOOL_DOMAINS[schoolCode] || [];

    const handleSendCode = async () => {
        setError("");
        const emailLower = schoolEmail.toLowerCase();
        if (!domains.some(d => emailLower.endsWith(d))) {
            setError(`Use a valid school email (${domains.join(" or ")})`);
            return;
        }
        setLoading(true);
        try {
            const result = await apiSendVerificationCode(schoolEmail, schoolCode);
            setVerificationId(result.verification_id);
            setStep("code");
        } catch (err) {
            setError(err.message || "Failed to send code.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setError("");
        setLoading(true);
        try {
            await apiVerifyCode(code.trim(), verificationId);
            updateUser({ email_verified: true, school_email: schoolEmail });
            navigate("/onboarding/password", { replace: true });
        } catch (err) {
            setError(err.message || "Verification failed.");
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
                            <div key={i} className={`h-1 flex-1 rounded-full ${i <= 2 ? "bg-slate-900" : "bg-slate-200"}`} />
                        ))}
                    </div>

                    {step === "email" ? (
                        <>
                            <button onClick={() => navigate("/onboarding/school", { replace: true })}
                                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 mb-3 transition-colors">
                                <ChevronLeft className="w-3 h-3" /> Back
                            </button>

                            <div className="mb-4">
                                <h2 className="text-lg font-bold text-slate-900">Verify your email</h2>
                                <p className="text-xs text-slate-400 mt-0.5">We'll send a code to your school inbox.</p>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-100 p-4">
                                <label className="block text-[11px] font-medium text-slate-500 mb-1">School email</label>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={schoolEmail}
                                        onChange={e => { setSchoolEmail(e.target.value); setError(""); }}
                                        placeholder={`yourname${domains[0] || "@school.ch"}`}
                                        className="w-full pl-8 pr-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
                                        onKeyDown={e => e.key === "Enter" && handleSendCode()}
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-start gap-2 bg-red-50 rounded-lg px-2.5 py-1.5 mt-2.5">
                                        <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-[11px] text-red-600">{error}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleSendCode}
                                    disabled={!schoolEmail || loading}
                                    className="w-full mt-3 py-2 rounded-lg bg-slate-900 text-white text-[13px] font-medium hover:bg-slate-800 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                                >
                                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send code"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <button onClick={() => { setStep("email"); setCode(""); setError(""); }}
                                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 mb-3 transition-colors">
                                <ChevronLeft className="w-3 h-3" /> Back
                            </button>

                            <div className="mb-4">
                                <h2 className="text-lg font-bold text-slate-900">Check your inbox</h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Enter the code sent to <span className="text-slate-600 font-medium">{schoolEmail}</span>
                                </p>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-100 p-4">
                                <label className="block text-[11px] font-medium text-slate-500 mb-1">6-digit code</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={e => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="w-full text-center text-xl font-bold tracking-[0.35em] text-slate-800 placeholder:text-slate-200 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
                                    onKeyDown={e => e.key === "Enter" && code.length === 6 && handleVerifyCode()}
                                />

                                {error && (
                                    <div className="flex items-start gap-2 bg-red-50 rounded-lg px-2.5 py-1.5 mt-2.5">
                                        <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-[11px] text-red-600">{error}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleVerifyCode}
                                    disabled={code.length < 6 || loading}
                                    className="w-full mt-3 py-2 rounded-lg bg-slate-900 text-white text-[13px] font-medium hover:bg-slate-800 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                                >
                                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
                                </button>

                                <button
                                    onClick={() => { setStep("email"); setCode(""); setError(""); }}
                                    className="w-full mt-2 text-center text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    Resend code
                                </button>
                            </div>
                        </>
                    )}

                    {/* Log in link */}
                    <div className="flex justify-center mt-6">
                        <p className="text-[11px] text-slate-400">
                            Already have an account?{" "}
                            <Link to="/login" className="text-slate-500 font-medium hover:text-slate-800 active:text-slate-900 transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
