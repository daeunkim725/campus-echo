import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiSignup, apiLogin, apiSendVerificationCode, apiVerifyCode } from "@/api/apiClient";
import { Mail, Lock, Loader2, Eye, EyeOff, ChevronLeft, Check, AlertCircle } from "lucide-react";

const SCHOOLS = [
    { code: "ETH", name: "ETH Zürich", domains: ["@ethz.ch", "@student.ethz.ch"], color: "#1A5276", short: "ET" },
    { code: "UNIZH", name: "UZH", domains: ["@uzh.ch", "@student.uzh.ch"], color: "#2980B9", short: "UZ" },
];

function isValidSchoolEmail(email, school) {
    const emailLower = email.toLowerCase();
    const isAdmin =
        emailLower.endsWith("@campusecho.app") ||
        ["admin@admin.com", "daeunkim725@gmail.com", "daeunkim@gmail.com", "daeun.kim725@gmail.com"].includes(emailLower);

    if (isAdmin) return true;
    return school.domains.some(d => emailLower.endsWith(d));
}

function getPasswordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0-4
}

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["", "#ef4444", "#f59e0b", "#22c55e", "#16a34a"];

// ───────────────────────────────────────────────
// Main Component
// ───────────────────────────────────────────────

export default function Login() {
    const [view, setView] = useState("login"); // "login" | "signup"
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F6F8FC] flex flex-col">
            {/* Compact header */}
            <div className="px-4 pt-8 pb-2">
                <div className="max-w-sm mx-auto flex items-center gap-2">
                    <span className="text-lg">🦇</span>
                    <span className="text-sm font-bold text-slate-800 tracking-tight">echo</span>
                </div>
            </div>

            <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-12">
                <div className="w-full max-w-sm">
                    {view === "login" ? (
                        <LoginForm onSwitch={() => setView("signup")} navigate={navigate} />
                    ) : (
                        <SignupFlow onSwitch={() => setView("login")} navigate={navigate} />
                    )}
                </div>
            </div>
        </div>
    );
}

// ───────────────────────────────────────────────
// LOGIN
// ───────────────────────────────────────────────

function LoginForm({ onSwitch, navigate }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const ADMIN_EMAILS = ["admin@admin.com", "daeunkim725@gmail.com", "daeunkim@gmail.com", "daeun.kim725@gmail.com"];

    const isAdminEmail = (em) => {
        const lower = em.toLowerCase();
        return lower.endsWith("@campusecho.app") || ADMIN_EMAILS.includes(lower);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isAdminEmail(email)) {
                // Client-side admin bypass — skip the backend entirely
                const adminUser = {
                    id: "admin_" + Date.now(),
                    email: email.toLowerCase(),
                    displayName: email.split("@")[0],
                    is_verified_student: true,
                    school_id: "ETH",
                    school: "ETH",
                    school_verified: true,
                    role: "admin",
                    verified_at: new Date().toISOString(),
                };
                // Create a simple base64 token that AuthContext can work with
                const fakeToken = btoa(JSON.stringify({ sub: adminUser.id, email: adminUser.email, role: "admin", exp: Date.now() + 86400000 }));
                localStorage.setItem("campus_echo_token", fakeToken);
                localStorage.setItem("campus_echo_user", JSON.stringify(adminUser));
                navigate("/");
                window.location.reload();
                return;
            }
            await apiLogin(email, password);
            navigate("/");
            window.location.reload();
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
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
                                placeholder="you@student.ethz.ch"
                                required
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
                                required
                                className="w-full pl-8 pr-9 py-2 text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Forgot password link */}
                <div className="flex justify-end mt-2">
                    <button type="button" className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
                        Forgot password?
                    </button>
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
                    className="w-full mt-4 py-2 rounded-lg bg-slate-900 text-white text-[13px] font-medium hover:bg-slate-800 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Log in"}
                </button>
            </form>

            {/* Switch to signup */}
            <p className="text-center text-[11px] text-slate-400 mt-5">
                New here?{" "}
                <button onClick={onSwitch} className="text-slate-700 font-medium hover:underline">
                    Join your campus
                </button>
            </p>
        </>
    );
}

// ───────────────────────────────────────────────
// SIGNUP (multi-step)
// ───────────────────────────────────────────────

function SignupFlow({ onSwitch, navigate }) {
    // Step: "school" → "email" → "code" → "password"
    const [step, setStep] = useState("school");
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [schoolEmail, setSchoolEmail] = useState("");
    const [verificationId, setVerificationId] = useState(null);
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ── Step 1: Choose school ──────────────────

    if (step === "school") {
        return (
            <>
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Join your campus</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Verified students only. Pick your school.</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {SCHOOLS.map(school => (
                        <button
                            key={school.code}
                            onClick={() => { setSelectedSchool(school); setStep("email"); setError(""); }}
                            className="flex items-center gap-2.5 bg-white rounded-xl border border-slate-100 px-3 py-2.5 text-left hover:border-slate-200 transition-all group"
                        >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                                style={{ backgroundColor: school.color }}>
                                {school.short}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-slate-800">{school.name}</p>
                                <p className="text-[10px] text-slate-400">{school.domains[0]}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <p className="text-center text-[11px] text-slate-400 mt-5">
                    Already have an account?{" "}
                    <button onClick={onSwitch} className="text-slate-700 font-medium hover:underline">
                        Log in
                    </button>
                </p>
            </>
        );
    }

    // ── Step 2: Enter school email ──────────────

    if (step === "email") {
        const handleSendCode = async () => {
            setError("");
            const emailLower = schoolEmail.toLowerCase();
            const isAdmin =
                emailLower.endsWith("@campusecho.app") ||
                ["admin@admin.com", "daeunkim725@gmail.com", "daeunkim@gmail.com", "daeun.kim725@gmail.com"].includes(emailLower);

            if (!isValidSchoolEmail(schoolEmail, selectedSchool)) {
                setError(`Use a valid ${selectedSchool.name} email (${selectedSchool.domains.join(" or ")})`);
                return;
            }

            // Admins bypass the OTP entirely
            if (isAdmin) {
                setStep("password");
                return;
            }

            setLoading(true);
            try {
                const result = await apiSendVerificationCode(schoolEmail, selectedSchool.code);
                setVerificationId(result.verification_id);
                setStep("code");
            } catch (err) {
                setError(err.message || "Failed to send code.");
            } finally {
                setLoading(false);
            }
        };

        return (
            <>
                <button onClick={() => { setStep("school"); setError(""); }}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 mb-3 transition-colors">
                    <ChevronLeft className="w-3 h-3" /> Back
                </button>

                <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Verify your email</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Send an echo to your {selectedSchool.name} inbox.</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">School email</label>
                    <div className="relative">
                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="email"
                            value={schoolEmail}
                            onChange={e => { setSchoolEmail(e.target.value); setError(""); }}
                            placeholder={`yourname${selectedSchool.domains[0]}`}
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
        );
    }

    // ── Step 3: Enter verification code ────────

    if (step === "code") {
        const handleVerifyCode = async () => {
            setError("");
            setLoading(true);
            try {
                await apiVerifyCode(code.trim(), verificationId);
                setStep("password");
            } catch (err) {
                setError(err.message || "Verification failed.");
            } finally {
                setLoading(false);
            }
        };

        return (
            <>
                <button onClick={() => { setStep("email"); setCode(""); setError(""); }}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 mb-3 transition-colors">
                    <ChevronLeft className="w-3 h-3" /> Back
                </button>

                <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Check your inbox</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Enter the code we echoed to <span className="text-slate-600 font-medium">{schoolEmail}</span>
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
        );
    }

    // ── Step 4: Create password ────────────────

    if (step === "password") {
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

            setLoading(true);
            try {
                await apiSignup(schoolEmail, password);
                navigate("/");
                window.location.reload();
            } catch (err) {
                setError(err.message || "Signup failed.");
            } finally {
                setLoading(false);
            }
        };

        return (
            <>
                <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-4.5 h-4.5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-[11px] text-green-600 font-medium">Email verified</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Set your password</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Last step — you're almost in.</p>
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

                            {/* Strength bar */}
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

                        {/* Confirm password */}
                        <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">Confirm password</label>
                            <div className="relative">
                                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type={showPw ? "text" : "password"}
                                    value={confirmPw}
                                    onChange={e => { setConfirmPw(e.target.value); setError(""); }}
                                    placeholder="Re-enter password"
                                    className={`w-full pl-8 pr-9 py-2 text-[13px] text-slate-800 placeholder:text-slate-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all ${pwMismatch ? "border-red-300 focus:border-red-300" : pwMatch ? "border-green-300 focus:border-green-300" : "border-slate-200 focus:border-slate-300"
                                        }`}
                                />
                                {pwMatch && (
                                    <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-green-500" />
                                )}
                            </div>
                            {pwMismatch && (
                                <p className="text-[10px] text-red-500 mt-0.5">Passwords don't match</p>
                            )}
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

                    <button
                        type="submit"
                        disabled={!password || !confirmPw || password !== confirmPw || loading}
                        className="w-full mt-4 py-2 rounded-lg bg-slate-900 text-white text-[13px] font-medium hover:bg-slate-800 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                    >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create account"}
                    </button>
                </form>
            </>
        );
    }

    return null;
}
