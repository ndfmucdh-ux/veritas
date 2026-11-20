import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from '@/components/layout/AppLayout';
import VeritasLogo from '@/components/ui/VeritasLogo';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthGate from '@/components/auth/AuthGate';
import { LanguageProvider } from '@/lib/LanguageContext';
import SplashScreen from '@/components/ui/SplashScreen';
import ViewTransitionLinks from '@/components/layout/ViewTransitionLinks';
import EmojiSanitizer from '@/components/layout/EmojiSanitizer';
import PageErrorBoundary from '@/components/ui/PageErrorBoundary';
import { useState, useEffect, lazy, Suspense } from 'react';
import { warmOfflineCache } from '@/lib/offlineBible';
import { routeLoaders } from '@/lib/routeLoaders';

// Home is the landing page — keep it eager so first paint is instant.
import Home from './pages/Home';

// Every other page is code-split into its own chunk, loaded only when visited.
// This keeps the initial bundle tiny (Home only) for maximum first-load speed.
const Read = lazy(routeLoaders["/read"]);
const Search = lazy(routeLoaders["/search"]);
const Library = lazy(routeLoaders["/library"]);
const Discover = lazy(routeLoaders["/discover"]);
const Plans = lazy(routeLoaders["/plans"]);
const Profile = lazy(routeLoaders["/profile"]);
const Study = lazy(routeLoaders["/study"]);
const VerseImageGenerator = lazy(routeLoaders["/verse-art"]);
const StudyCenter = lazy(routeLoaders["/study-center"]);
const PrayerJournal = lazy(routeLoaders["/prayer-journal"]);
const CommunityHub = lazy(routeLoaders["/community"]);
const NotificationStudio = lazy(routeLoaders["/notification-studio"]);
const AudioDashboard = lazy(routeLoaders["/audio-dashboard"]);
const ForYouSection = lazy(routeLoaders["/for-you"]);
const Unsubscribe = lazy(() => import("@/pages/Unsubscribe"));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div style={{ boxShadow: "0 0 30px rgba(255,215,0,0.3)" }} className="rounded-2xl">
            <VeritasLogo size={60} className="rounded-2xl" />
          </div>
          <div className="w-8 h-8 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin"></div>
          <p className="text-muted-foreground text-sm font-cinzel tracking-widest">VERITAS</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <PageErrorBoundary resetKey={location.pathname}>
    <ViewTransitionLinks />
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public routes — no login required */}
        <Route path="/" element={<Home />} />
        <Route path="/read" element={<Read />} />
        <Route path="/search" element={<Search />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/study" element={<Study />} />
        <Route path="/plans/:kind?/:planId?" element={<Plans />} />

        {/* Protected routes — require login */}
        <Route element={<ProtectedRoute unauthenticatedElement={<AuthGate />} />}>
          <Route path="/library/:tab?" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verse-art" element={<VerseImageGenerator />} />
          <Route path="/study-center/:tab?" element={<StudyCenter />} />
          <Route path="/prayer-journal" element={<PrayerJournal />} />
          <Route path="/community/:tab?/:groupId?" element={<CommunityHub />} />
          <Route path="/notification-studio" element={<NotificationStudio />} />
          <Route path="/audio-dashboard" element={<AudioDashboard />} />
          <Route path="/for-you/:category" element={<ForYouSection />} />
        </Route>
      </Route>
      <Route path="/unsubscribe" element={<Suspense fallback={null}><Unsubscribe /></Suspense>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </PageErrorBoundary>
  );
};

function App() {
  useEffect(() => { warmOfflineCache(); }, []);

  const [splashDone, setSplashDone] = useState(() => {
    // Only show splash once per session
    const shown = sessionStorage.getItem("veritas_splash_shown");
    if (shown) return true;
    return false;
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem("veritas_splash_shown", "1");
    setSplashDone(true);
  };



  return (
    <AuthProvider>
      <LanguageProvider>
      <QueryClientProvider client={queryClientInstance}>
        {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <EmojiSanitizer />
      </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;