import { create } from 'zustand';
import type { User } from 'firebase/auth';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  OAuthProvider,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, appId } from '../lib/firebase';
import { compressImage } from '../utils/image';
import { safeRecipeIdFromTitle } from '../utils/recipe';
import type { FavoriteRecipe } from '../types';
import { useAppStore } from './useAppStore';

interface AuthState {
  user: User | null;
  _didSetPersistence: boolean;
  _lastAccountUid: string | null;
  _unsubscribe: (() => void) | null;

  /** Computed-like getters */
  getEffectiveUser: () => User | null;
  getIsAccountUser: () => boolean;

  /** Actions */
  initAuth: () => () => void;
  signInGoogle: (guestFavorites: FavoriteRecipe[], clearGuestFavorites: () => void) => Promise<void>;
  signInApple: (guestFavorites: FavoriteRecipe[], clearGuestFavorites: () => void) => Promise<void>;
  doSignOut: () => Promise<void>;
  _signInWithProvider: (provider: GoogleAuthProvider | OAuthProvider, guestFavorites: FavoriteRecipe[], clearGuestFavorites: () => void) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  _didSetPersistence: false,
  _lastAccountUid: null,
  _unsubscribe: null,

  getEffectiveUser: () => auth.currentUser ?? get().user,
  getIsAccountUser: () => {
    const u = get().getEffectiveUser();
    return !!u && !u.isAnonymous;
  },

  initAuth: () => {
    // Set persistence once
    if (!get()._didSetPersistence) {
      set({ _didSetPersistence: true });
      (async () => {
        try {
          await setPersistence(auth, browserLocalPersistence);
        } catch {
          try {
            await setPersistence(auth, browserSessionPersistence);
          } catch {
            // fallback to default
          }
        }
      })();
    }

    // Subscribe to auth state changes
    const unsub = onAuthStateChanged(auth, (user) => {
      set({ user });
      if (user && !user.isAnonymous && user.uid) {
        set({ _lastAccountUid: user.uid });
      }
    });
    set({ _unsubscribe: unsub });
    return unsub;
  },

  signInGoogle: async (guestFavorites, clearGuestFavorites) => {
    await get()._signInWithProvider(new GoogleAuthProvider(), guestFavorites, clearGuestFavorites);
  },

  signInApple: async (guestFavorites, clearGuestFavorites) => {
    await get()._signInWithProvider(new OAuthProvider('apple.com'), guestFavorites, clearGuestFavorites);
  },

  _signInWithProvider: async (
    provider: GoogleAuthProvider | OAuthProvider,
    guestFavorites: FavoriteRecipe[],
    clearGuestFavorites: () => void,
  ) => {
    const { language, setErrorState, setShowAuth } = useAppStore.getState();
    setErrorState(null);

    if (!appId) {
      setErrorState(language === 'ru' ? 'Не загружен appId (firebase-config.js).' : 'Missing appId (firebase-config.js).');
      return;
    }

    try {
      const cred = await signInWithPopup(auth, provider);
      const u = cred.user;
      if (u && guestFavorites.length > 0) {
        await Promise.allSettled(
          guestFavorites.map(async (r) => {
            const id = safeRecipeIdFromTitle(r.title);
            const { id: _ignoreId, ...data } = (r as any) || {};
            let finalImage: string | null = r.image || null;
            if (finalImage && finalImage.startsWith('data:image/')) {
              finalImage = await compressImage(finalImage);
            }
            await setDoc(doc(db, 'artifacts', appId, 'users', u.uid, 'favorites', id), {
              ...data,
              image: finalImage,
              timestamp: Date.now(),
            });
          }),
        );
        clearGuestFavorites();
      }
      setShowAuth(false);
    } catch (e) {
      console.error('Sign-in error', e);
      const providerName = provider instanceof GoogleAuthProvider ? 'Google' : 'Apple';
      setErrorState(language === 'ru' ? `Не удалось войти через ${providerName}.` : `${providerName} sign-in failed.`);
    }
  },

  doSignOut: async () => {
    const { language, setErrorState, setShowAuth } = useAppStore.getState();
    setErrorState(null);
    try {
      await signOut(auth);
      setShowAuth(false);
    } catch (e) {
      console.error('Sign-out error', e);
      setErrorState(language === 'ru' ? 'Не удалось выйти.' : 'Sign out failed.');
    }
  },
} as AuthState));
