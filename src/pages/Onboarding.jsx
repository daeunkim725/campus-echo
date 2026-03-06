import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { GraduationCap, Mail, CheckCircle, ArrowRight, Loader2, Smile } from "lucide-react";

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
  { code: "ETH", name: "ETH Zürich", domains: ["@ethz.ch", "@student.ethz.ch"], color: "#1A5276" },
  { code: "EPFL", name: "EPFL", domains: ["@epfl.ch"], color: "#E74C3C" },
  { code: "UNIZH", name: "Uni Zürich", domains: ["@uzh.ch", "@student.uzh.ch"], color: "#2980B9" },
  { code: "UNIBASEL", name: "Uni Basel", domains: ["@unibas.ch"], color: "#8E44AD" },
  { code: "UNIBE", name: "Uni Bern", domains: ["@unibe.ch", "@students.unibe.ch"], color: "#D35400" },
  { code: "UNIL", name: "Uni Lausanne", domains: ["@unil.ch"], color: "#27AE60" },
  { code: "UNIFR", name: "Uni Fribourg", domains: ["@unifr.ch"], color: "#C0392B" },
  { code: "UNIGE", name: "Uni Genève", domains: ["@unige.ch", "@etu.unige.ch"], color: "#1ABC9C" },
  { code: "UNISG", name: "Uni St. Gallen", domains: ["@unisg.ch", "@student.unisg.ch"], color: "#2C3E50" },
  { code: "USI", name: "USI Lugano", domains: ["@usi.ch", "@student.usi.ch"], color: "#E67E22" },
  { code: "UNILU", name: "Uni Lucerne", domains: ["@unilu.ch", "@student.unilu.ch"], color: "#16A085" },
];

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

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      if (u?.school_verified || u?.role === 'admin') {
        window.location.href = createPageUrl("Home");
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
    setStep("mood");
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
          <h2 className="text-xl font-bold text-slate-900 mb-1">You're verified! Ready to fly.</h2>
          <p className="text-slate-500">Welcome to the {selectedSchool?.name} community 🦇</p>
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
              <div className="grid grid-cols-2 gap-3">
                {SCHOOLS.map(school => (
                  <button
                    key={school.code}
                    onClick={() => handleSchoolSelect(school)}
                    className="bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-violet-300 hover:shadow-sm transition-all active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: school.color }}>
                      {school.code.slice(0, 2)}
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">{school.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{school.domains[0]}</p>
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