/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Events from './pages/Events';
import Home from './pages/Home';
import Login from './pages/Login';
import Market from './pages/Market';
import MarketInbox from './pages/MarketInbox';
import Moderation from './pages/Moderation';
import Notifications from './pages/Notifications';
import Observability from './pages/Observability';
import Onboarding from './pages/Onboarding';
import OnboardingAge from './pages/OnboardingAge';
import OnboardingPassword from './pages/OnboardingPassword';
import OnboardingProfile from './pages/OnboardingProfile';
import OnboardingSchool from './pages/OnboardingSchool';
import OnboardingVerify from './pages/OnboardingVerify';
import PostDetail from './pages/PostDetail';
import SchoolFeed from './pages/SchoolFeed';
import OnboardingAge from './pages/OnboardingAge';
import OnboardingPassword from './pages/OnboardingPassword';
import OnboardingProfile from './pages/OnboardingProfile';
import OnboardingSchool from './pages/OnboardingSchool';
import OnboardingVerify from './pages/OnboardingVerify';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Events": Events,
    "Home": Home,
    "Login": Login,
    "Market": Market,
    "MarketInbox": MarketInbox,
    "Moderation": Moderation,
    "Notifications": Notifications,
    "Observability": Observability,
    "Onboarding": Onboarding,
    "OnboardingAge": OnboardingAge,
    "OnboardingPassword": OnboardingPassword,
    "OnboardingProfile": OnboardingProfile,
    "OnboardingSchool": OnboardingSchool,
    "OnboardingVerify": OnboardingVerify,
    "PostDetail": PostDetail,
    "SchoolFeed": SchoolFeed,
    "OnboardingAge": OnboardingAge,
    "OnboardingPassword": OnboardingPassword,
    "OnboardingProfile": OnboardingProfile,
    "OnboardingSchool": OnboardingSchool,
    "OnboardingVerify": OnboardingVerify,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};