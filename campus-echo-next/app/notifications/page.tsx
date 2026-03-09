"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import NavBar from "@/components/NavBar";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
    const { user, isLoadingAuth } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoadingAuth && !user) router.replace("/login");
    }, [user, isLoadingAuth, router]);

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#F6F8FC" }}>
            <NavBar />

            <div className="max-w-xl mx-auto px-4 py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No notifications yet</p>
                <p className="text-slate-400 text-sm mt-1">Notifications will appear here when someone interacts with your posts.</p>
            </div>
        </div>
    );
}
