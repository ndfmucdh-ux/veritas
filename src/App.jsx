import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from '@/components/layout/AppLayout';
import VeritasLogo from '@/components/ui/VeritasLogo';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthGate from '@/components/auth/AuthGate';
import { LanguageProvider } from '@/lib/LanguageContext';
import SplashScreen from '@/components/ui/SplashScreen';
import { useState, useEffect } from 'react';
import { warmOfflineCache } from '@/lib/offlineBible';

// Page imports
import Home from './pages/Home';
import Read from './pages/Read';
import Search from './pages/Search';
import Library from './pages/Library';
import Discover from './pages/Discover';
import Plans from './pages/Plans';
import Profile from './pages/Profile';
import Study from './pages/Study';
import VerseImageGenerator from './pages/VerseImageGenerator';
import StudyCenter from './pages/StudyCenter';
import PrayerJournal from './pages/PrayerJournal';
import CommunityHub from './pages/CommunityHub';
import NotificationStudio from './pages/NotificationStudio';
import AudioDashboard from './pages/AudioDashboard';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public routes — no login required */}
        <Route path="/" element={<Home />} />
        <Route path="/read" element={<Read />} />
        <Route path="/search" element={<Search />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/study" element={<Study />} />
        <Route path="/plans" element={<Plans />} />

        {/* Protected routes — require login */}
        <Route element={<ProtectedRoute unauthenticatedElement={<AuthGate />} />}>
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verse-art" element={<VerseImageGenerator />} />
          <Route path="/study-center" element={<StudyCenter />} />
          <Route path="/prayer-journal" element={<PrayerJournal />} />
          <Route path="/community" element={<CommunityHub />} />
          <Route path="/notification-studio" element={<NotificationStudio />} />
          <Route path="/audio-dashboard" element={<AudioDashboard />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
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

  // Prevent swipe-back page reload on iOS
  useEffect(() => {
    const preventSwipeBack = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        if (touch.clientX < 10 || touch.clientX > window.innerWidth - 10) {
          e.preventDefault();
        }
      }
    };
    document.addEventListener("touchmove", preventSwipeBack, { passive: false });
    return () => document.removeEventListener("touchmove", preventSwipeBack);
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
      <QueryClientProvider client={queryClientInstance}>
        {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;