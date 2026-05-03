import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from '@/components/layout/AppLayout';
import VeritasLogo from '@/components/ui/VeritasLogo';
import { LanguageProvider } from '@/lib/LanguageContext';
import SplashScreen from '@/components/ui/SplashScreen';
import { useState } from 'react';

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
        <Route path="/" element={<Home />} />
        <Route path="/read" element={<Read />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/study" element={<Study />} />
        <Route path="/verse-art" element={<VerseImageGenerator />} />
        <Route path="/study-center" element={<StudyCenter />} />
        <Route path="/prayer-journal" element={<PrayerJournal />} />
        <Route path="/community" element={<CommunityHub />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
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
      </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;