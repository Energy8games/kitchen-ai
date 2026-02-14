import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

import { useAuth } from './hooks/useAuth';
import { useFavorites } from './hooks/useFavorites';
import { useScanner } from './hooks/useScanner';
import { useAppStore, useTranslations } from './stores/useAppStore';

import Navbar from './components/layout/Navbar';
import ErrorToast from './components/layout/ErrorToast';
import AuthModal from './components/modals/AuthModal';
import SettingsPanel from './components/modals/SettingsPanel';
import LiveScanner from './components/scanner/LiveScanner';
import HomePage from './components/home/HomePage';
import CookingView from './components/cooking/CookingView';
import FavoritesView from './components/favorites/FavoritesView';

/* ─── inner shell that lives inside <BrowserRouter> ─── */
const AppShell: React.FC = () => {
  const t = useTranslations();
  const isMealLoading = useAppStore((s) => s.isMealLoading);
  const showSettings = useAppStore((s) => s.showSettings);
  const showAuth = useAppStore((s) => s.showAuth);

  // lifecycle
  useAuth();

  // favorites (hook must be called unconditionally)
  const {
    favorites,
    guestFavorites,
    cloudFavorites,
    toggleFavorite,
    isFavorite,
    setGuestFavorites,
    shouldPreferCloud,
    // debug props for SettingsPanel
    debugServerFavoritesCount,
    setDebugServerFavoritesCount,
    debugServerFavoritesError,
    setDebugServerFavoritesError,
    debugLastFavoritesWriteError,
    debugProbeResult,
    setDebugProbeResult,
    debugChannelProbeResult,
    setDebugChannelProbeResult,
    debugRestListResult,
    setDebugRestListResult,
  } = useFavorites();

  // scanner
  const { isScannerOpen, isScanningAI, videoRef, canvasRef, startScanner, stopScanner } =
    useScanner();

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-800 overflow-x-hidden">
      <Navbar favoritesCount={favorites.length} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-20">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                startScanner={startScanner}
                toggleFavorite={toggleFavorite}
                isFavorite={isFavorite}
              />
            }
          />
          <Route path="/cooking" element={<CookingView />} />
          <Route
            path="/favorites"
            element={
              <FavoritesView favorites={favorites} toggleFavorite={toggleFavorite} />
            }
          />
        </Routes>
      </main>

      {/* ── overlays ── */}
      {showAuth && (
        <AuthModal
          guestFavorites={guestFavorites}
          clearGuestFavorites={() => setGuestFavorites([])}
        />
      )}

      {showSettings && (
        <SettingsPanel
          cloudFavorites={cloudFavorites}
          guestFavorites={guestFavorites}
          shouldPreferCloud={shouldPreferCloud}
          debugServerFavoritesCount={debugServerFavoritesCount}
          setDebugServerFavoritesCount={setDebugServerFavoritesCount}
          debugServerFavoritesError={debugServerFavoritesError}
          setDebugServerFavoritesError={setDebugServerFavoritesError}
          debugLastFavoritesWriteError={debugLastFavoritesWriteError}
          debugProbeResult={debugProbeResult}
          setDebugProbeResult={setDebugProbeResult}
          debugChannelProbeResult={debugChannelProbeResult}
          setDebugChannelProbeResult={setDebugChannelProbeResult}
          debugRestListResult={debugRestListResult}
          setDebugRestListResult={setDebugRestListResult}
        />
      )}

      {isScannerOpen && (
        <LiveScanner
          isScannerOpen={isScannerOpen}
          videoRef={videoRef}
          canvasRef={canvasRef}
          isScanningAI={isScanningAI}
          stopScanner={stopScanner}
        />
      )}

      <ErrorToast />

      {isMealLoading && (
        <div className="fixed inset-0 z-[200] bg-white/95 flex flex-col items-center justify-center gap-8 animate-in fade-in">
          <div className="relative">
            <div className="w-28 h-28 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
            <ChefHat
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600"
              size={36}
            />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">
            {t.visualizing}
          </p>
        </div>
      )}
    </div>
  );
};

/* ─── root component ─── */
const App: React.FC = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;
