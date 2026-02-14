import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, CheckCircle2, Globe, Heart, User as UserIcon } from 'lucide-react';
import { useAppStore, useTranslations } from '../../stores/useAppStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRecipeStore } from '../../stores/useRecipeStore';

interface NavbarProps {
  favoritesCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ favoritesCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslations();
  const toggleLanguage = useAppStore((s) => s.toggleLanguage);
  const showSettings = useAppStore((s) => s.showSettings);
  const toggleSettings = useAppStore((s) => s.toggleSettings);
  const showAuth = useAppStore((s) => s.showAuth);
  const toggleAuth = useAppStore((s) => s.toggleAuth);
  const user = useAuthStore((s) => s.user);
  const resetRecipeView = useRecipeStore((s) => s.resetRecipeView);

  const isFavorites = location.pathname === '/favorites';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.03] px-4 sm:px-6 pb-4 pt-[calc(1rem+var(--safe-top))] flex items-center justify-between gap-3">
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => {
          resetRecipeView();
          navigate('/');
        }}
      >
        <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
          <ChefHat size={22} />
        </div>
        <span className="text-lg font-black tracking-tighter uppercase italic">Kitchen.AI</span>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          onClick={toggleLanguage}
          className="p-2.5 bg-slate-50 border border-black/[0.05] rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-100 transition-all"
          aria-label="Toggle language"
        >
          <Globe size={16} />
        </button>

        <button
          onClick={toggleSettings}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
            showSettings
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
              : 'bg-white border border-black/[0.05] text-slate-500 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 size={14} className={showSettings ? 'text-white' : 'text-emerald-500'} />
          {t.dietBtn}
        </button>

        <button
          onClick={() => navigate('/favorites')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase transition-all ${
            isFavorites
              ? 'bg-slate-900 text-white shadow-xl'
              : 'bg-white border border-black/[0.05] text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Heart size={14} className={isFavorites ? 'fill-white' : ''} />
          {favoritesCount}
        </button>

        <button
          onClick={toggleAuth}
          className={`p-2.5 rounded-xl border border-black/[0.05] overflow-hidden transition-all ${
            showAuth ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'
          }`}
          aria-label="Profile"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} className="w-6 h-6 rounded-full" alt="profile" />
          ) : (
            <UserIcon size={16} />
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
