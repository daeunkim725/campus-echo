import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

const SCHOOLS = [
{ code: "ETH", name: "ETH Zürich", domains: ["@ethz.ch", "@student.ethz.ch"], color: "#1A5276", short: "ET" },
{ code: "UNIZH", name: "UZH", domains: ["@uzh.ch", "@student.uzh.ch"], color: "#2980B9", short: "UZ" }];


export default function OnboardingSchool() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const handleSelect = (school) => {
    updateUser({ school_id: school.code, school: school.code });
    navigate("/onboarding/verify", { replace: true });
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
                        {[1, 2, 3, 4, 5].map((i) =>
            <div key={i} className={`h-1 flex-1 rounded-full ${i === 1 ? "bg-slate-900" : "bg-slate-200"}`} />
            )}
                    </div>

                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-slate-900">Choose your school</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Verified students only. Pick your campus.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {SCHOOLS.map((school) =>
            <button
              key={school.code}
              onClick={() => handleSelect(school)}
              className="flex items-center gap-2.5 bg-white rounded-xl border border-slate-100 px-3 py-3 text-left hover:border-slate-300 hover:shadow-sm transition-all group">

                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
              style={{ backgroundColor: school.color }}>
                                    {school.short}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[13px] font-semibold text-slate-800">{school.name}</p>
                                    <p className="text-[10px] text-slate-400">{school.domains[0]}</p>
                                </div>
                            </button>
            )}
                    </div>

                    {/* Log in link */}
                    <Link
            to="/login" className="bg-slate-500 text-[#fafafa] mt-5 py-2.5 text-sm font-medium rounded-xl w-full hover:bg-slate-500 transition-all flex items-center justify-center gap-1.5">Already have an account? Log in



          </Link>
                </div>
            </div>
        </div>);

}