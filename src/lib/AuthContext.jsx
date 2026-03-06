import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiMe, apiLogout, hasToken, clearToken } from '@/api/apiClient';

const AuthContext = createContext(null);

const ADMIN_EMAILS = ["admin@admin.com", "daeunkim725@gmail.com", "daeunkim@gmail.com", "daeun.kim725@gmail.com"];

function isAdminEmail(email) {
  if (!email) return false;
  const lower = email.toLowerCase();
  return lower.endsWith("@campusecho.app") || ADMIN_EMAILS.includes(lower);
}

/**
 * Checks completion flags in order and returns the first
 * incomplete onboarding route, or null if fully onboarded.
 */
export function getOnboardingRoute(user) {
  if (!user) return '/login';

  // Admins skip all onboarding
  if (user.role === 'admin' || isAdminEmail(user.email)) return null;

  if (!user.school_id) return '/onboarding/school';
  if (!user.email_verified) return '/onboarding/verify';
  if (!user.password_set) return '/onboarding/password';

  // Age gate: if under-18 countdown is active, redirect there
  if (!user.age_verified) return '/onboarding/age';
  if (user.unlock_at && new Date(user.unlock_at) > new Date()) return '/onboarding/age';

  if (!user.profile_complete) return '/onboarding/profile';

  return null; // Fully onboarded → main app
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      if (!hasToken()) {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
        return;
      }

      // Check for client-side admin session first
      const cachedUser = localStorage.getItem('campus_echo_user');
      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          if (parsed.role === 'admin') {
            setUser(parsed);
            setIsAuthenticated(true);
            setIsLoadingAuth(false);
            return;
          }
        } catch { /* fall through to apiMe */ }
      }

      const userData = await apiMe();
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);

      if (error.status === 401) {
        clearToken();
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      } else {
        setAuthError({ type: 'unknown', message: error.message || 'Auth check failed' });
      }
    }
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      // Also update localStorage for admin users
      if (updated.role === 'admin') {
        localStorage.setItem('campus_echo_user', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const logout = async (shouldRedirect = true) => {
    try {
      await apiLogout();
    } catch {
      clearToken();
    }

    localStorage.removeItem('campus_echo_user');
    localStorage.removeItem('campus_echo_token');
    localStorage.removeItem('campus_echo_theme');
    localStorage.removeItem('admin_setup_complete');

    // Clear any Base44 SDK keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("base44") || key.startsWith("b44") || key.includes("token") || key.includes("session"))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // Clear cookies
    document.cookie.split(";").forEach(c => {
      document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });

    setUser(null);
    setIsAuthenticated(false);

    if (shouldRedirect) {
      window.location.replace('/login');
    }
  };

  const navigateToLogin = () => {
    window.location.replace('/login');
  };

  const refreshUser = async () => {
    try {
      const userData = await apiMe();
      setUser(userData);
      return userData;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings: null,
      logout,
      navigateToLogin,
      checkAppState: checkAuth,
      refreshUser,
      updateUser,
      getOnboardingRoute: () => getOnboardingRoute(user),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
