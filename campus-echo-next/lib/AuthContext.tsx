"use client";

import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth as authApi } from "@/lib/apiClient";

// ─── Types ─────────────────────────────────────────────────────────────────

interface User {
    id: string;
    email: string;
    display_name?: string;
    handle: string;
    anon_id: string;
    role: string;
    school_id?: string | null;
    school?: string | null;
    school_email?: string | null;
    school_verified: boolean;
    age_verified: boolean;
    verified_at?: string | null;
    unlock_at?: string | null;
    mood?: string | null;
    avatar_base?: string | null;
    avatar_accessory?: string | null;
}

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoadingAuth: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<User | null>;
    updateUser: (updates: Partial<User>) => void;
    getOnboardingRoute: () => string | null;
}

const ADMIN_EMAILS = new Set(["admin@admin.com", "daeunkim725@gmail.com", "daeunkim@gmail.com", "daeun.kim725@gmail.com"]);
function isAdminEmail(email: string) {
    return email.endsWith("@campusecho.app") || ADMIN_EMAILS.has(email.toLowerCase());
}

export function getOnboardingRoute(user: User | null): string | null {
    if (!user) return "/login";
    if (user.role === "admin" || isAdminEmail(user.email)) return null;
    if (!user.school_id) return "/onboarding/school";
    if (!user.school_verified) return "/onboarding/verify";
    if (!user.age_verified) return "/onboarding/age";
    return null;
}

// ─── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const router = useRouter();

    const checkAuth = useCallback(async () => {
        try {
            setIsLoadingAuth(true);
            const userData = (await authApi.me()) as User;
            if (!userData.role && isAdminEmail(userData.email)) {
                userData.role = "admin";
            }
            setUser(userData);
            setIsAuthenticated(true);
        } catch {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoadingAuth(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = useCallback(async (email: string, password: string) => {
        const data = (await authApi.login(email, password)) as { user: User };
        setUser(data.user);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(async () => {
        try { await authApi.logout(); } catch { /* ignore */ }
        setUser(null);
        setIsAuthenticated(false);
        router.replace("/login");
    }, [router]);

    const refreshUser = useCallback(async (): Promise<User | null> => {
        try {
            const data = (await authApi.me()) as User;
            setUser(data);
            return data;
        } catch {
            return null;
        }
    }, []);

    const updateUser = useCallback((updates: Partial<User>) => {
        setUser((prev) => (prev ? { ...prev, ...updates } : prev));
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoadingAuth,
                login,
                logout,
                refreshUser,
                updateUser,
                getOnboardingRoute: () => getOnboardingRoute(user),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
