import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { GraduationCap, Mail, CheckCircle, ArrowRight, Loader2, Smile, Lock, MoreHorizontal } from "lucide-react";

const MOODS = [
{ value: "happy", label: "Happy 😊" },
{ value: "sleepy", label: "Sleepy 😴" },
{ value: "anxious", label: "Anxious 😰" },
{ value: "focused", label: "Focused 🎯" },
{ value: "bored", label: "Bored 😐" },
{ value: "excited", label: "Excited 🤩" },
{ value: "stressed", label: "Stressed 😤" },
{ value: "chill", label: "Chill 😎" },
{ value: "hungry", label: "Hungry 🍕" },
{ value: "caffeinated", label: "Caffeinated ☕" },
{ value: "lost", label: "Lost 🗺️" },
{ value: "vibing", label: "Vibing 🎵" }];


const SCHOOLS = [
{ code: "ETH", name: "ETH Zürich", domains: ["@ethz.ch", "@student.ethz.ch"], color: "#215CAF", featured: true },
{ code: "UNIZH", name: "UZH", domains: ["@uzh.ch", "@student.uzh.ch"], color: "#0028A5", featured: true },
{ code: "EPFL", name: "EPFL", domains: ["@epfl.ch"], color: "#E74C3C" },
{ code: "UNIBASEL", name: "Uni Basel", domains: ["@unibas.ch"], color: "#8E44AD" },
{ code: "UNIBE", name: "Uni Bern", domains: ["@unibe.ch", "@students.unibe.ch"], color: "#D35400" },
{ code: "UNIL", name: "Uni Lausanne", domains: ["@unil.ch"], color: "#27AE60" },
{ code: "UNIFR", name: "Uni Fribourg", domains: ["@unifr.ch"], color: "#C0392B" },
{ code: "UNIGE", name: "Uni Genève", domains: ["@unige.ch", "@etu.unige.ch"], color: "#1ABC9C" },
{ code: "UNISG", name: "Uni St. Gallen", domains: ["@unisg.ch", "@student.unisg.ch"], color: "#2C3E50" },
{ code: "USI", name: "USI Lugano", domains: ["@usi.ch", "@student.usi.ch"], color: "#E67E22" },
{ code: "UNILU", name: "Uni Lucerne", domains: ["@unilu.ch", "@student.unilu.ch"], color: "#16A085" }];


function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!targetDate) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;
      if (distance < 0) {
        setTimeLeft("Unlocked! Refresh page.");
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
        const minutes = Math.floor(distance % (1000 * 60 * 60) / (1000 * 60));
        const seconds = Math.floor(distance % (1000 * 60) / 1000);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return <>{timeLeft || "Calculating..."}</>;
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidSchoolEmail(email, school) {
  return school.domains.some((d) => email.toLowerCase().endsWith(d));
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function Onboarding() {
  const [step, setStep] = useState("school"); // school | email | code | age | mood | locked | done
  const [selectedSchoolCode, setSelectedSchoolCode] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [schoolEmail, setSchoolEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    base44.auth.me().then(async (u) => {
      setCurrentUser(u);

      // Allow testing by resetting state if ?reset=1
      if (params.get("reset") === "1") {
        await base44.auth.updateMe({ school_verified: false, age_verified: false, mood: null, school: null, unlock_at: null });
        setStep("school");
        return;
      }

      if (u?.unlock_at && !u?.age_verified) {
        const unlockTime = new Date(u.unlock_at).getTime();
        if (Date.now() >= unlockTime) {
          base44.auth.updateMe({ age_verified: true, unlock_at: null }).then(() => {
            if (u.mood) window.location.href = createPageUrl("Home");else
            setStep("mood");
          });
          return;
        } else {
          setStep("locked");
          return;
        }
      }

      const isTesting = params.get("test") === "1";
      if (u?.school_verified && u?.age_verified && u?.mood && u?.role !== 'admin' && !isTesting) {
        window.location.href = createPageUrl("Home");
      } else if (u?.school_verified && !u?.password_hash) {
        const sc = SCHOOLS.find((s) => s.code === u.school);
        if (sc) {
          setSelectedSchool(sc);
          setSelectedSchoolCode(sc.code);
        }
        setStep("password");
      } else if (u?.school_verified && u?.password_hash && !u?.age_verified) {
        const sc = SCHOOLS.find((s) => s.code === u.school);
        if (sc) {
          setSelectedSchool(sc);
          setSelectedSchoolCode(sc.code);
        }
        setStep("age");
      } else if (u?.school_verified && u?.age_verified && !u?.mood) {
        const sc = SCHOOLS.find((s) => s.code === u.school);
        if (sc) {
          setSelectedSchool(sc);
          setSelectedSchoolCode(sc.code);
        }
        setStep("mood");
      } else if (u?.school_verified) {
        const sc = SCHOOLS.find((s) => s.code === u.school);
        if (sc) {
          setSelectedSchool(sc);
          setSelectedSchoolCode(sc.code);
        }
      }
    }).catch(() => base44.auth.redirectToLogin(createPageUrl("Onboarding")));
  }, []);

  const handleSchoolClick = (school) => {
    if (!school.featured) return;
    setSelectedSchoolCode(school.code);
    setSelectedSchool(school);
  };

  const handleContinue = () => {
    if (selectedSchool) {
      setError("");
      setStep("email");
    }
  };

  const handleSendCode = async () => {
    setError("");
    if (!isValidSchoolEmail(schoolEmail, selectedSchool)) {
      setError(`Please use a valid ${selectedSchool.name} email (${selectedSchool.domains.join(" or ")})`);
      return;
    }
    setLoading(true);
    const generatedCode = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const record = await base44.entities.EmailVerification.create({
      user_id: currentUser.id,
      school_email: schoolEmail,
      school: selectedSchool.code,
      code: generatedCode,
      verified: false,
      expires_at: expires
    });
    setVerificationId(record.id);
    setSentCode(generatedCode);

    await base44.integrations.Core.SendEmail({
      to: schoolEmail,
      subject: "Verify your school email – Echo",
      body: `Hi!\n\nYour verification code for Echo is:\n\n${generatedCode}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this, please ignore this email.`
    });

    setLoading(false);
    setStep("code");
  };

  const handleVerifyCode = async () => {
    setError("");
    setLoading(true);

    const records = await base44.entities.EmailVerification.filter({ user_id: currentUser.id, verified: false });
    const record = records.find((r) => r.id === verificationId);

    if (!record) {setError("Verification record not found. Please start over.");setLoading(false);return;}
    if (new Date(record.expires_at) < new Date()) {setError("Code expired. Please request a new one.");setLoading(false);return;}
    if (record.code !== code.trim()) {setError("Incorrect code. Please try again.");setLoading(false);return;}

    await base44.entities.EmailVerification.update(record.id, { verified: true });
    await base44.auth.updateMe({
      school: selectedSchool.code,
      school_verified: true,
      school_email: schoolEmail
    });

    setLoading(false);
    setStep("password");
  };

  const handlePasswordSubmit = async () => {
    setError("");
    if (password.length < 8 || password.length > 12) {
      setError("Password must be 8-12 characters long.");
      return;
    }
    if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError("Password must include at least one number or symbol.");
      return;
    }
    const commonPasswords = ["password123", "password", "12345678", "qwertyuiop"];
    if (commonPasswords.includes(password.toLowerCase())) {
      setError("Please choose a less common password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const hash = await hashPassword(password);
      await base44.auth.updateMe({ password_hash: hash });
      setLoading(false);
      setStep("age");
    } catch (err) {
      setError("Failed to secure password. Try again.");
      setLoading(false);
    }
  };

  const handleAgeVerify = async () => {
    if (!dob) return;
    setLoading(true);
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || m === 0 && today.getDate() < dobDate.getDate()) {
      age--;
    }

    if (age >= 18) {
      await base44.auth.updateMe({ dob, age_verified: true, unlock_at: null });
      setLoading(false);
      setStep("mood");
    } else {
      const unlockDate = new Date(dobDate.getFullYear() + 18, dobDate.getMonth(), dobDate.getDate());
      await base44.auth.updateMe({ dob, age_verified: false, unlock_at: unlockDate.toISOString() });
      setCurrentUser((prev) => ({ ...prev, unlock_at: unlockDate.toISOString() }));
      setLoading(false);
      setStep("locked");
    }
  };

  const handleMoodSelect = async () => {
    if (!selectedMood) return;
    setLoading(true);
    await base44.auth.updateMe({ mood: selectedMood });
    setLoading(false);
    setStep("done");
    setTimeout(() => {
      const school = selectedSchool?.code;
      window.location.href = createPageUrl("SchoolFeed") + (school ? `?school=${school}` : "");
    }, 1500);
  };

  const accentColor = selectedSchool?.color || "#0F172A";

  if (step === "done") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: accentColor + "1A" }}>
            <CheckCircle className="w-8 h-8" style={{ color: accentColor }} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">All set!</h2>
          <p className="text-slate-500">Welcome to the {selectedSchool?.name} community 🎉</p>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-sans text-[#0B1220]">
      {/* Header */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E7EB] px-4 py-3 sticky top-0 z-30">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#FFFFFF] border border-[#E5E7EB] flex items-center justify-center shadow-sm">
              <span className="text-[16px]">🦇</span>
            </div>
            <h1 className="text-[17px] font-bold text-[#0B1220] tracking-tight">Echo</h1>
          </div>
          {currentUser?.role === 'admin' &&
          <div className="relative">
                <button onClick={() => {
              const menu = document.getElementById('admin-menu');
              menu.classList.toggle('hidden');
            }} className="w-8 h-8 flex items-center justify-center text-[#64748B] hover:bg-[#F7F8FA] rounded-full transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                <div id="admin-menu" className="hidden absolute right-0 top-10 w-44 bg-[#FFFFFF] rounded-[16px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-[#E5E7EB] py-1.5 z-40">
                  <div className="px-4 py-2 border-b border-[#E5E7EB] mb-1">
                     <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Admin Tools</p>
                  </div>
                  <button onClick={() => window.location.href = createPageUrl("Onboarding") + "?reset=1"} className="w-full text-left px-4 py-2 text-[14px] font-medium text-[#0B1220] hover:bg-[#F7F8FA]">Reset test</button>
                  <button onClick={() => window.location.href = createPageUrl("Home")} className="w-full text-left px-4 py-2 text-[14px] font-medium text-[#0B1220] hover:bg-[#F7F8FA]">Skip to feed</button>
                </div>
             </div>
          }
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-6 relative">
        <div className="w-full max-w-sm">

          {/* Step: Choose School */}
          {step === "school" &&
          <div className="pb-32">
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-[#0B1220] mb-1.5 tracking-tight">Choose your school</h2>
                <p className="text-xs font-light">Select the university you're enrolled at to join your community.</p>
              </div>

              {/* Live schools */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {SCHOOLS.filter((s) => s.featured).map((school) => {const isSelected = selectedSchoolCode === school.code;
                return (
                  <button
                    key={school.code}
                    onClick={() => handleSchoolClick(school)}
                    className={`relative flex flex-col items-center p-4 rounded-xl transition-all duration-200 active:scale-[0.98] text-center border ${
                    isSelected ?
                    "bg-[#FFFFFF] shadow-sm" :
                    "bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:border-slate-300 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)]"}`
                    }
                    style={{
                      borderColor: isSelected ? school.color : "",
                      backgroundColor: isSelected ? school.color + "08" : "#FFFFFF"
                    }}>

                      {/* Live indicator */}
                      <div className="absolute top-2.5 left-3 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: school.color }}></span>
                        <span className="text-[10px] font-medium" style={{ color: school.color }}>Live</span>
                      </div>

                      {/* Checkmark when selected */}
                      {isSelected &&
                    <div className="absolute top-2.5 right-3 w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: school.color }}>
                          <CheckCircle className="w-2.5 h-2.5" strokeWidth={3} />
                        </div>
                    }

                      <div className="w-10 h-10 rounded-xl mb-2.5 flex items-center justify-center text-[#0B1220] text-sm font-bold bg-[#F7F8FA] border border-[#E5E7EB]">
                        {school.code === 'UNIZH' ? 'UZH' : school.code.slice(0, 3)}
                      </div>
                      <p className="font-semibold text-[#0B1220] text-sm mb-0.5">{school.name}</p>
                      <p className="text-xs text-[#64748B]">{school.domains[0]}</p>
                    </button>);

              })}
              </div>

              {/* Coming soon schools */}
              <div className="border border-[#E5E7EB] rounded-xl bg-[#FFFFFF] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
                <button
                onClick={() => setShowComingSoon(!showComingSoon)}
                className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-[#64748B] hover:bg-[#F7F8FA] transition-colors">

                  More schools coming soon
                  <span className="text-[#64748B] text-lg leading-none font-light">{showComingSoon ? '−' : '+'}</span>
                </button>
                
                {showComingSoon &&
              <div className="p-4 pt-0 grid grid-cols-2 gap-2 bg-[#FFFFFF]">
                    {SCHOOLS.filter((s) => !s.featured).map((school) =>
                <div
                  key={school.code}
                  className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-[16px] p-3 flex items-center gap-3 opacity-60">

                        <div className="w-9 h-9 rounded-[12px] bg-[#FFFFFF] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] text-[11px] font-bold shrink-0">
                          {school.code.slice(0, 3)}
                        </div>
                        <p className="font-medium text-[#64748B] text-[13px] truncate">{school.name}</p>
                      </div>
                )}
                  </div>
              }
              </div>

              {/* Sticky Continue Button */}
              {selectedSchoolCode &&
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F7F8FA] via-[#F7F8FA]/90 to-transparent animate-in slide-in-from-bottom flex justify-center z-20 pb-8">
                  <div className="w-full max-w-sm px-4">
                    <button
                  onClick={handleContinue} className="text-[#ffffff] py-2.5 text-sm font-semibold opacity-75 rounded-xl w-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all hover:opacity-90 active:scale-[0.98]"

                  style={{ backgroundColor: accentColor }}>

                      Continue
                    </button>
                  </div>
                </div>
            }
            </div>
          }

          {/* Step: Enter School Email */}
          {step === "email" &&
          <div>
              <button onClick={() => setStep("school")} className="text-xs text-[#64748B] hover:text-[#0B1220] mb-6 flex items-center gap-1.5 font-medium transition-colors">
                ← Back
              </button>
              <div className="mb-6 text-center">
                <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: accentColor + "1A", color: accentColor }}>
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-[#0B1220] mb-1.5 tracking-tight">Verify your {selectedSchool.name} email</h2>
                <p className="text-[#64748B] text-sm">Enter your official student email to receive a verification code.</p>
              </div>
              <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">School Email</label>
                <input
                type="email"
                value={schoolEmail}
                onChange={(e) => {setSchoolEmail(e.target.value);setError("");}}
                placeholder={`e.g. yourname${selectedSchool.domains[0]}`}
                className="w-full bg-white text-[#000000] text-sm placeholder:text-[#94A3B8] focus:outline-none border border-[#E5E7EB] rounded-xl px-3 py-2.5 transition-all"
                onFocus={(e) => {
                  e.target.style.borderColor = accentColor;
                  e.target.style.boxShadow = `0 0 0 4px ${accentColor}25`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "";
                  e.target.style.boxShadow = "";
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSendCode()} />

                {error && <p className="text-[#E74C3C] text-xs mt-2 font-medium">{error}</p>}
                
                <button
                onClick={handleSendCode}
                disabled={!schoolEmail || loading}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-all hover:opacity-90 active:scale-[0.98] shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                style={{ backgroundColor: accentColor }}>

                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Send Code</>}
                </button>
              </div>
            </div>
          }

          {/* Step: Enter Code */}
          {step === "code" &&
          <div>
              <div className="mb-5 text-center">
                <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-3" style={{ backgroundColor: accentColor + "1A", color: accentColor }}>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 mb-1 tracking-tight">Enter your code</h2>
                <p className="text-slate-500 text-xs">We sent a 6-digit code to <span className="font-semibold text-slate-800">{schoolEmail}</span>.</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <input
                type="text"
                value={code}
                onChange={(e) => {setCode(e.target.value.replace(/\D/g, "").slice(0, 6));setError("");}}
                placeholder="000000"
                maxLength={6}
                className="w-full text-center text-2xl font-black tracking-[0.5em] text-slate-800 placeholder:text-slate-200 focus:outline-none border border-slate-200 rounded-lg px-3 py-3 transition-colors focus:border-slate-300"
                onFocus={(e) => e.target.style.borderColor = accentColor}
                onBlur={(e) => e.target.style.borderColor = ""}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()} />

                {error && <p className="text-red-500 text-[10px] mt-2 text-center font-medium">{error}</p>}
                <button
                onClick={handleVerifyCode}
                disabled={code.length < 6 || loading}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white font-bold text-sm disabled:opacity-40 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: accentColor }}>

                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-3.5 h-3.5" /> Verify</>}
                </button>
                <button
                onClick={() => {setStep("email");setCode("");setError("");}}
                className="mt-3 w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">

                  Resend code
                </button>
              </div>
            </div>
          }

          {/* Step: Password */}
          {step === "password" &&
          <div>
              <div className="mb-5 text-center">
                <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-3" style={{ backgroundColor: accentColor + "1A", color: accentColor }}>
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 mb-1 tracking-tight">Create a password</h2>
                <p className="text-slate-500 text-xs">Secure your account for future logins.</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {setPassword(e.target.value);setError("");}}
                      className="w-full text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none border border-slate-200 rounded-lg px-3 py-2.5 transition-colors focus:border-slate-300"
                      onFocus={(e) => e.target.style.borderColor = accentColor}
                      onBlur={(e) => e.target.style.borderColor = ""}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {setConfirmPassword(e.target.value);setError("");}}
                    className="w-full text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none border border-slate-200 rounded-lg px-3 py-2.5 transition-colors focus:border-slate-300"
                    onFocus={(e) => e.target.style.borderColor = accentColor}
                    onBlur={(e) => e.target.style.borderColor = ""}
                    onKeyDown={(e) => e.key === "Enter" && password && confirmPassword && handlePasswordSubmit()}
                  />
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 mt-0.5">
                  <p className={`flex items-center gap-1 ${password.length >= 8 && password.length <= 12 ? 'text-green-600' : ''}`}>
                    <span className="w-1 h-1 rounded-full bg-current"></span> 8-12 characters
                  </p>
                  <p className={`flex items-center gap-1 ${/[0-9!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : ''}`}>
                    <span className="w-1 h-1 rounded-full bg-current"></span> 1 number or symbol
                  </p>
                </div>

                {error && <p className="text-red-500 text-[10px] mt-1 font-medium">{error}</p>}
                
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!password || !confirmPassword || password !== confirmPassword || loading}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white font-bold text-sm disabled:opacity-40 transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: accentColor }}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-3.5 h-3.5" /> Continue</>}
                </button>
              </div>
            </div>
          }

          {/* Step: Age Gate */}
          {step === "age" &&
          <div>
              <div className="mb-5 text-center">
                <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-3" style={{ backgroundColor: accentColor + "1A" }}>
                  <span className="text-xl">🎂</span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 mb-1 tracking-tight">When were you born?</h2>
                <p className="text-slate-500 text-xs">You must be at least 18 years old to join Echo.</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date of Birth</p>
                <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none border border-slate-200 rounded-lg px-3 py-2.5 transition-colors focus:border-slate-300"
                onFocus={(e) => e.target.style.borderColor = accentColor}
                onBlur={(e) => e.target.style.borderColor = ""} />

                <button
                onClick={handleAgeVerify}
                disabled={!dob || loading}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white font-bold text-sm disabled:opacity-40 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: accentColor }}>

                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-3.5 h-3.5" /> Continue</>}
                </button>
              </div>
            </div>
          }

          {/* Step: Locked */}
          {step === "locked" &&
          <div className="text-center bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: accentColor + "1A", color: accentColor }}>
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1.5">Not yet unlocked</h2>
              <p className="text-slate-500 mb-5 text-xs">You must be 18 to use Echo. You'll be able to join on <span className="font-semibold text-slate-700">{new Date(currentUser?.unlock_at).toLocaleDateString()}</span>.</p>
              
              <div className="bg-slate-50 rounded-lg p-3 mb-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Time remaining</p>
                <div className="text-sm font-mono font-bold" style={{ color: accentColor }}>
                  <CountdownTimer targetDate={currentUser?.unlock_at} />
                </div>
              </div>
            </div>
          }

          {/* Step: Choose Mood */}
          {step === "mood" &&
          <div>
              <div className="mb-5 text-center">
                <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-3" style={{ backgroundColor: accentColor + "1A", color: accentColor }}>
                  <Smile className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 mb-1 tracking-tight">How are you feeling?</h2>
                <p className="text-slate-500 text-xs">Pick your current vibe — this will be your anonymous identity. You can change it anytime.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                {MOODS.map((m) => {
                const isSelected = selectedMood === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => setSelectedMood(m.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                    isSelected ?
                    "text-white shadow-sm" :
                    "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`
                    }
                    style={isSelected ? { backgroundColor: accentColor, borderColor: accentColor } : {}}>

                      {m.label}
                    </button>);

              })}
              </div>
              <button
              onClick={handleMoodSelect}
              disabled={!selectedMood || loading}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white font-bold text-sm disabled:opacity-40 transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: accentColor }}>

                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-3.5 h-3.5" /> Enter Echo</>}
              </button>
            </div>
          }

        </div>
      </div>
    </div>);

}