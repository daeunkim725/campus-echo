"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getOnboardingRoute } from "@/lib/AuthContext";

export default function Home() {
    const { user, isLoadingAuth, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoadingAuth) return;
        if (!isAuthenticated) { router.replace("/login"); return; }
        const next = getOnboardingRoute(user);
        router.replace(next ?? "/feed");
    }, [isLoadingAuth, isAuthenticated, user, router]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        </div>
    );
}
