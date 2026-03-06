import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiMe, apiLogout, hasToken, clearToken } from '@/api/apiClient';

const AuthContext = createContext(null);

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

  const logout = async (shouldRedirect = true) => {
    try {
      await apiLogout();
    } catch {
      clearToken();
    }

    setUser(null);
    setIsAuthenticated(false);

    if (shouldRedirect) {
      window.location.href = '/Login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/Login';
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
