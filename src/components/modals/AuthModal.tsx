import React from 'react';
import { LogOut } from 'lucide-react';
import { useAppStore, useTranslations } from '../../stores/useAppStore';
import { useAuthStore } from '../../stores/useAuthStore';
import type { FavoriteRecipe } from '../../types';

interface AuthModalProps {
  guestFavorites: FavoriteRecipe[];
  clearGuestFavorites: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ guestFavorites, clearGuestFavorites }) => {
  const showAuth = useAppStore((s) => s.showAuth);
  const t = useTranslations();

  const user = useAuthStore((s) => s.user);
  const signInGoogle = useAuthStore((s) => s.signInGoogle);
  const signInApple = useAuthStore((s) => s.signInApple);
  const doSignOut = useAuthStore((s) => s.doSignOut);

  const setShowAuth = useAppStore((s) => s.setShowAuth);

  if (!showAuth) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in"
      onClick={() => setShowAuth(false)}
    >
      <div
        className="max-w-sm w-full mx-6 p-8 bg-white rounded-[3rem] shadow-2xl border border-black/[0.02] animate-in zoom-in-95 slide-in-from-bottom-4 text-center space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-black text-slate-800">{t.authTitle}</h3>

        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t.welcome}</p>
          <p className="text-sm font-bold text-slate-700">
            {user?.displayName || (user?.isAnonymous ? t.anonymousUser : user?.email) || t.anonymousUser}
          </p>
        </div>

        <div className="space-y-3">
          {!user || user.isAnonymous ? (
            <>
              <button
                onClick={() => signInGoogle(guestFavorites, clearGuestFavorites)}
                className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm text-slate-700 hover:bg-white transition-all"
              >
                Google
              </button>
              <button
                onClick={() => signInApple(guestFavorites, clearGuestFavorites)}
                className="w-full py-4 bg-black rounded-2xl flex items-center justify-center gap-3 font-bold text-sm text-white hover:opacity-80 transition-all"
              >
                Apple
              </button>
            </>
          ) : (
            <button
              onClick={doSignOut}
              className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> {t.signOut}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
