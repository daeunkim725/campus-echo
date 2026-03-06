import React, { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "@/utils";

/**
 * Onboarding — lightweight redirect handler.
 * 
 * The multi-step signup + school verification flow now lives entirely in Login.jsx.
 * If a user lands here:
 *   - Not authenticated → redirect to Login
 *   - Authenticated + verified → redirect to SchoolFeed
 *   - Authenticated + not verified → redirect to Login (signup flow handles verification)
 */
export default function Onboarding() {
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();

  useEffect(() => {
    if (isLoadingAuth) return;

    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }

    if (user?.school_verified || user?.is_verified_student || user?.role === "admin") {
      const school = user?.school || "ETH";
      window.location.href = createPageUrl("SchoolFeed") + `?school=${school}`;
    } else {
      // Not verified — redirect to Login which handles the signup/verify flow
      navigateToLogin();
    }
  }, [isAuthenticated, isLoadingAuth, user]);

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
    </div>
  );
}