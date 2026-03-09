import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth, getOnboardingRoute } from '@/lib/AuthContext';
import { ThemeProvider } from '@/components/utils/ThemeProvider';

// Main app pages
import Home from './pages/Home';
import SchoolFeed from './pages/SchoolFeed';
import Market from './pages/Market';
import MarketInbox from './pages/MarketInbox';
import Events from './pages/Events';
import Notifications from './pages/Notifications';
import PostDetail from './pages/PostDetail';
import Moderation from './pages/Moderation';
import Observability from './pages/Observability';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Layout from './Layout.jsx';

// Onboarding pages
import OnboardingSchool from './pages/onboarding/OnboardingSchool';
import OnboardingVerify from './pages/onboarding/OnboardingVerify';
import OnboardingPassword from './pages/onboarding/OnboardingPassword';
import OnboardingAge from './pages/onboarding/OnboardingAge';
import OnboardingProfile from './pages/onboarding/OnboardingProfile';

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { user, isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  // Public pages
  const isLoginPage = currentPath === '/login';
  const isOnboardingPage = currentPath.startsWith('/onboarding');

  // Show loading spinner while checking auth (skip for login page)
  if (!isLoginPage && (isLoadingPublicSettings || isLoadingAuth)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F6F8FC]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not authenticated? Only allow login page and onboarding pages
  if (!isLoginPage && !isOnboardingPage && !isAuthenticated) {
    return <Navigate to="/onboarding/school" replace />;
  }

  // Authenticated? Check onboarding completion
  if (isAuthenticated && user) {
    const onboardingRoute = getOnboardingRoute(user);

    // If on login page and authenticated, redirect to onboarding or main app
    if (isLoginPage) {
      return <Navigate to={onboardingRoute || "/"} replace />;
    }

    // If onboarding incomplete and not on the correct onboarding page
    if (onboardingRoute && currentPath !== onboardingRoute) {
      return <Navigate to={onboardingRoute} replace />;
    }

    // If onboarding complete but trying to access an onboarding page
    if (!onboardingRoute && isOnboardingPage) {
      return <Navigate to="/" replace />;
    }
  }

  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Onboarding steps */}
      <Route path="/onboarding/school" element={<OnboardingSchool />} />
      <Route path="/onboarding/verify" element={<OnboardingVerify />} />
      <Route path="/onboarding/password" element={<OnboardingPassword />} />
      <Route path="/onboarding/age" element={<OnboardingAge />} />
      <Route path="/onboarding/profile" element={<OnboardingProfile />} />

      {/* Main app (wrapped in layout) */}
      <Route path="/" element={<LayoutWrapper currentPageName="Home"><Home /></LayoutWrapper>} />
      <Route path="/home" element={<LayoutWrapper currentPageName="Home"><Home /></LayoutWrapper>} />
      <Route path="/schoolfeed" element={<LayoutWrapper currentPageName="SchoolFeed"><SchoolFeed /></LayoutWrapper>} />
      <Route path="/market" element={<LayoutWrapper currentPageName="Market"><Market /></LayoutWrapper>} />
      <Route path="/marketinbox" element={<LayoutWrapper currentPageName="MarketInbox"><MarketInbox /></LayoutWrapper>} />
      <Route path="/events" element={<LayoutWrapper currentPageName="Events"><Events /></LayoutWrapper>} />
      <Route path="/notifications" element={<LayoutWrapper currentPageName="Notifications"><Notifications /></LayoutWrapper>} />
      <Route path="/postdetail" element={<LayoutWrapper currentPageName="PostDetail"><PostDetail /></LayoutWrapper>} />
      <Route path="/moderation" element={<LayoutWrapper currentPageName="Moderation"><Moderation /></LayoutWrapper>} />
      <Route path="/observability" element={<LayoutWrapper currentPageName="Observability"><Observability /></LayoutWrapper>} />
      <Route path="/Leaderboard" element={<LayoutWrapper currentPageName="Leaderboard"><Leaderboard /></LayoutWrapper>} />

      {/* Catch-all */}
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
