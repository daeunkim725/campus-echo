import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { GraduationCap, Mail, CheckCircle, ArrowRight, Loader2, Smile, Lock } from "lucide-react";

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
  { value: "vibing", label: "Vibing 🎵" },
];

const SCHOOLS = [
  { code: "ETH", name: "ETH Zürich", domains: ["@ethz.ch", "@student.ethz.ch"], color: "#215CAF", featured: true },
  { code: "UNIZH", name: "Uni Zürich", domains: ["@uzh.ch", "@student.uzh.ch"], color: "#0028A5", featured: true },
  { code: "EPFL", name: "EPFL", domains: ["@epfl.ch"], color: "#E74C3C" },
  { code: "UNIBASEL", name: "Uni Basel", domains: ["@unibas.ch"], color: "#8E44AD" },
  { code: "UNIBE", name: "Uni Bern", domains: ["@unibe.ch", "@students.unibe.ch"], color: "#D35400" },
  { code: "UNIL", name: "Uni Lausanne", domains: ["@unil.ch"], color: "#27AE60" },
  { code: "UNIFR", name: "Uni Fribourg", domains: ["@unifr.ch"], color: "#C0392B" },
  { code: "UNIGE", name: "Uni Genève", domains: ["@unige.ch", "@etu.unige.ch"], color: "#1ABC9C" },
  { code: "UNISG", name: "Uni St. Gallen", domains: ["@unisg.ch", "@student.unisg.ch"], color: "#2C3E50" },
  { code: "USI", name: "USI Lugano", domains: ["@usi.ch", "@student.usi.ch"], color: "#E67E22" },
  { code: "UNILU", name: "Uni Lucerne", domains: ["@unilu.ch", "@student.unilu.ch"], color: "#16A085" },
];

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
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
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
  return school.domains.some(d => email.toLowerCase().endsWith(d));
}

export default function Onboarding() {
  const [step, setStep] = useState("school"); // school | email | code | mood | done
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolEmail, setSchoolEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [dob, setDob] = useState("");

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      
      if (u?.unlock_at && !u?.age_verified) {
         const unlockTime = new Date(u.unlock_at).getTime();
         if (Date.now() >= unlockTime) {
            base44.auth.updateMe({ age_verified: true, unlock_at: null }).then(() => {
                if (u.mood) window.location.href = createPageUrl("Home");
                else setStep("mood");
            });
            return;
         } else {
            setStep("locked");
            return;
         }
      }

      if (u?.school_verified && u?.age_verified && u?.mood && u?.role !== 'admin') {
        window.location.href = createPageUrl("Home");
      } else if (u?.school_verified && !u?.age_verified) {
        setStep("age");
      } else if (u?.school_verified && u?.age_verified && !u?.mood) {
        setStep("mood");
      }
    }).catch(() => base44.auth.redirectToLogin(createPageUrl("Onboarding")));
  }, []);

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setError("");
    setStep("email");
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
      expires_at: expires,
    });
    setVerificationId(record.id);
    setSentCode(generatedCode);

    await base44.integrations.Core.SendEmail({
      to: schoolEmail,
      subject: "Verify your school email – fizz",
      body: `Hi!\n\nYour verification code for fizz is:\n\n${generatedCode}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this, please ignore this email.`,
    });

    setLoading(false);
    setStep("code");
  };

  const handleVerifyCode = async () => {
    setError("");
    setLoading(true);

    const records = await base44.entities.EmailVerification.filter({ user_id: currentUser.id, verified: false });
    const record = records.find(r => r.id === verificationId);

    if (!record) { setError("Verification record not found. Please start over."); setLoading(false); return; }
    if (new Date(record.expires_at) < new Date()) { setError("Code expired. Please request a new one."); setLoading(false); return; }
    if (record.code !== code.trim()) { setError("Incorrect code. Please try again."); setLoading(false); return; }

    await base44.entities.EmailVerification.update(record.id, { verified: true });
    await base44.auth.updateMe({
      school: selectedSchool.code,
      school_verified: true,
      school_email: schoolEmail,
    });

    setLoading(false);
    setStep("age");
  };

  const handleAgeVerify = async () => {
    if (!dob) return;
    setLoading(true);
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    if (age >= 18) {
      await base44.auth.updateMe({ dob, age_verified: true, unlock_at: null });
      setLoading(false);
      setStep("mood");
    } else {
      const unlockDate = new Date(dobDate.getFullYear() + 18, dobDate.getMonth(), dobDate.getDate());
      await base44.auth.updateMe({ dob, age_verified: false, unlock_at: unlockDate.toISOString() });
      setCurrentUser(prev => ({ ...prev, unlock_at: unlockDate.toISOString() }));
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

  if (step === "done") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">All set!</h2>
          <p className="text-slate-500">Welcome to the {selectedSchool?.name} community 🎉</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">F</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">fizz</h1>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          
          {currentUser?.role === 'admin' && (
            <div className="mb-6 p-4 bg-violet-50 border border-violet-100 rounded-2xl flex items-center justify-between">
              <p className="text-sm text-violet-800 font-medium">Viewing as Admin</p>
              <button onClick={() => window.location.href = createPageUrl("Home")} className="text-sm font-bold text-violet-600 hover:text-violet-800">
                Go to Feed →
              </button>
            </div>
          )}

          {/* Step: Choose School */}
          {step === "school" && (
            <div>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-violet-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Choose your school</h2>
                <p className="text-slate-500 text-sm">Select the university you're enrolled at. You'll only see your school's community.</p>
              </div>
              {/* Featured schools */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {SCHOOLS.filter(s => s.featured).map(school => (
                  <button
                    key={school.code}
                    onClick={() => handleSchoolSelect(school)}
                    className="border-2 rounded-2xl p-4 text-left hover:shadow-md transition-all active:scale-95 relative overflow-hidden"
                    style={{ borderColor: school.color, backgroundColor: school.color + "08" }}
                  >
                    <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: school.color }}>
                      {school.code.slice(0, 3)}
                    </div>
                    <p className="font-bold text-slate-800 text-sm">{school.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{school.domains[0]}</p>
                    <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: school.color }}>LIVE</span>
                  </button>
                ))}
              </div>
              {/* Other schools */}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Other schools (coming soon)</p>
              <div className="grid grid-cols-2 gap-2">
                {SCHOOLS.filter(s => !s.featured).map(school => (
                  <button
                    key={school.code}
                    onClick={() => handleSchoolSelect(school)}
                    className="bg-white border border-slate-200 rounded-xl p-3 text-left hover:border-slate-300 hover:shadow-sm transition-all active:scale-95 opacity-60"
                  >
                    <div className="w-6 h-6 rounded-md mb-1.5 flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ backgroundColor: school.color }}>
                      {school.code.slice(0, 2)}
                    </div>
                    <p className="font-semibold text-slate-700 text-xs">{school.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Enter School Email */}
          {step === "email" && (
            <div>
              <button onClick={() => setStep("school")} className="text-sm text-slate-400 hover:text-slate-600 mb-5 flex items-center gap-1">
                ← Back
              </button>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-violet-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Verify your {selectedSchool.name} email</h2>
                <p className="text-slate-500 text-sm">Enter your official student email to receive a verification code.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">School Email</p>
                <input
                  type="email"
                  value={schoolEmail}
                  onChange={e => { setSchoolEmail(e.target.value); setError(""); }}
                  placeholder={`e.g. yourname${selectedSchool.domains[0]}`}
                  className="w-full text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none border border-slate-200 rounded-xl px-4 py-3"
                  onKeyDown={e => e.key === "Enter" && handleSendCode()}
                />
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                <button
                  onClick={handleSendCode}
                  disabled={!schoolEmail || loading}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 disabled:opacity-40 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Send Code</>}
                </button>
              </div>
            </div>
          )}

          {/* Step: Age Gate */}
          {step === "age" && (
            <div>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">🎂</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">When were you born?</h2>
                <p className="text-slate-500 text-sm">You must be at least 18 years old to join fizz.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date of Birth</p>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none border border-slate-200 rounded-xl px-4 py-3"
                />
                <button
                  onClick={handleAgeVerify}
                  disabled={!dob || loading}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 disabled:opacity-40 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Continue</>}
                </button>
              </div>
            </div>
          )}

          {/* Step: Locked */}
          {step === "locked" && (
            <div className="text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Not yet unlocked</h2>
              <p className="text-slate-500 mb-6 text-sm">You must be 18 to use fizz. You'll be able to join on {new Date(currentUser?.unlock_at).toLocaleDateString()}.</p>
              
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Time remaining</p>
                <div className="text-xl font-mono font-bold text-violet-600">
                  <CountdownTimer targetDate={currentUser?.unlock_at} />
                </div>
              </div>
            </div>
          )}

          {/* Step: Choose Mood */}
          {step === "mood" && (
            <div>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                  <Smile className="w-6 h-6 text-violet-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">How are you feeling?</h2>
                <p className="text-slate-500 text-sm">Pick your current vibe — this will be your anonymous identity. You can change it anytime.</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {MOODS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setSelectedMood(m.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      selectedMood === m.value
                        ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-violet-300"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleMoodSelect}
                disabled={!selectedMood || loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 disabled:opacity-40 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Enter fizz</>}
              </button>
            </div>
          )}

          {/* Step: Enter Code */}
          {step === "code" && (
            <div>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-violet-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Enter your code</h2>
                <p className="text-slate-500 text-sm">We sent a 6-digit code to <span className="font-medium text-slate-700">{schoolEmail}</span>. Check your inbox.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <input
                  type="text"
                  value={code}
                  onChange={e => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full text-center text-3xl font-bold tracking-[0.5em] text-slate-800 placeholder:text-slate-200 focus:outline-none border border-slate-200 rounded-xl px-4 py-4"
                  onKeyDown={e => e.key === "Enter" && handleVerifyCode()}
                />
                {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
                <button
                  onClick={handleVerifyCode}
                  disabled={code.length < 6 || loading}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 disabled:opacity-40 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Verify</>}
                </button>
                <button
                  onClick={() => { setStep("email"); setCode(""); setError(""); }}
                  className="mt-3 w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Resend code
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}