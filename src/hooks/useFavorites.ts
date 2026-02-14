import { useEffect, useRef, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocsFromServer,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { auth, db, appId } from '../lib/firebase';
import { useAuthStore } from '../stores/useAuthStore';
import { useAppStore } from '../stores/useAppStore';
import { useRecipeStore } from '../stores/useRecipeStore';
import { compressImage } from '../utils/image';
import { recipeIdCandidatesFromTitle } from '../utils/recipe';
import type { FavoriteRecipe, Recipe } from '../types';

export const useFavorites = () => {
  const user = useAuthStore((s) => s.user);
  const getEffectiveUser = useAuthStore((s) => s.getEffectiveUser);
  const getIsAccountUser = useAuthStore((s) => s.getIsAccountUser);
  const language = useAppStore((s) => s.language);

  const [guestFavorites, setGuestFavorites] = useState<FavoriteRecipe[]>([]);
  const [cloudFavorites, setCloudFavorites] = useState<FavoriteRecipe[]>([]);
  const lastAccountUidRef = useRef<string | null>(null);

  // Debug states
  const [debugServerFavoritesCount, setDebugServerFavoritesCount] = useState<number | null>(null);
  const [debugServerFavoritesError, setDebugServerFavoritesError] = useState<string | null>(null);
  const [debugLastFavoritesWriteError, setDebugLastFavoritesWriteError] = useState<string | null>(null);
  const [debugProbeResult, setDebugProbeResult] = useState<string | null>(null);
  const [debugChannelProbeResult, setDebugChannelProbeResult] = useState<string | null>(null);
  const [debugRestListResult, setDebugRestListResult] = useState<string | null>(null);

  const effectiveUser = getEffectiveUser();
  const isAccountUser = getIsAccountUser();

  useEffect(() => {
    if (isAccountUser && effectiveUser?.uid) lastAccountUidRef.current = effectiveUser.uid;
  }, [isAccountUser, effectiveUser?.uid]);

  const shouldPreferCloud = isAccountUser || (!!lastAccountUidRef.current && !effectiveUser);
  const favorites = shouldPreferCloud ? cloudFavorites : guestFavorites;

  // Firestore subscription for authenticated users
  useEffect(() => {
    if (!appId) {
      console.error('Missing appId (window.__app_id).');
      return;
    }
    const u = auth.currentUser ?? user;
    if (!u || u.isAnonymous) return;

    const cacheKey = `kitchen-ai:favorites:account:${appId}:${u.uid}`;

    const readAccountCache = (): FavoriteRecipe[] => {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return [];
        const parsed = JSON.parse(cached);
        return Array.isArray(parsed) ? (parsed as FavoriteRecipe[]) : [];
      } catch {
        return [];
      }
    };

    const writeAccountCache = (items: FavoriteRecipe[]) => {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(items));
      } catch {
        // ignore
      }
    };

    const cachedNow = readAccountCache();
    if (cachedNow.length > 0) setCloudFavorites(cachedNow);

    // Best-effort initial load
    (async () => {
      try {
        const snap = await getDocsFromServer(collection(db, 'artifacts', appId, 'users', u.uid, 'favorites'));
        const next = snap.docs.map((d) => ({ ...(d.data() as any), id: d.id }));
        setCloudFavorites(next);
        writeAccountCache(next);
      } catch (e) {
        console.error('Firestore read error', e);
        useAppStore.getState().setErrorState(
          language === 'ru' ? 'Нет доступа к избранному (Firestore).' : 'Cannot read favorites (Firestore).',
        );
      }
    })();

    return onSnapshot(
      collection(db, 'artifacts', appId, 'users', u.uid, 'favorites'),
      { includeMetadataChanges: true },
      (snap) => {
        const next = snap.docs.map((d) => ({ ...(d.data() as any), id: d.id }));

        if (next.length === 0) {
          if (!snap.metadata.fromCache) {
            setCloudFavorites([]);
            writeAccountCache([]);
          }
          return;
        }

        setCloudFavorites(next);
        writeAccountCache(next);
      },
      (err) => {
        console.error('Firestore error', err);
        useAppStore.getState().setErrorState(
          language === 'ru' ? 'Ошибка Firestore (избранное).' : 'Firestore error (favorites).',
        );
      },
    );
  }, [user]);

  const toggleFavorite = async (r: Recipe) => {
    const { language, setErrorState } = useAppStore.getState();
    const recipeImage = useRecipeStore.getState().recipeImage;

    if (!appId) {
      setErrorState(language === 'ru' ? 'Не загружен appId (firebase-config.js).' : 'Missing appId (firebase-config.js).');
      return;
    }

    const explicitId = (r as any)?.id as string | undefined;
    const candidates = recipeIdCandidatesFromTitle(r.title);

    const u = auth.currentUser ?? user;
    if (!u || u.isAnonymous) {
      setGuestFavorites((prev) => {
        const existingIndex = prev.findIndex((f) => {
          if (explicitId && f.id === explicitId) return true;
          return typeof f.id === 'string' && candidates.includes(f.id);
        });

        if (existingIndex >= 0) {
          return prev.filter((_, i) => i !== existingIndex);
        }

        const idToStore = candidates[0];
        const image: string | null = recipeImage || (r as any).image || null;
        return [...prev, { ...(r as any), id: idToStore, image, timestamp: Date.now() }];
      });
      return;
    }

    try {
      const existing = cloudFavorites.find((f) => typeof f.id === 'string' && candidates.includes(f.id));

      const cacheKey = `kitchen-ai:favorites:account:${appId}:${u.uid}`;
      const writeAccountCache = (items: FavoriteRecipe[]) => {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(items));
        } catch {
          // ignore
        }
      };

      if (explicitId) {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', u.uid, 'favorites', explicitId));
        setCloudFavorites((prev) => {
          const next = prev.filter((f) => f.id !== explicitId);
          writeAccountCache(next);
          return next;
        });
        return;
      }

      if (existing?.id) {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', u.uid, 'favorites', existing.id));
        setCloudFavorites((prev) => {
          const next = prev.filter((f) => f.id !== existing.id);
          writeAccountCache(next);
          return next;
        });
      } else {
        const idToWrite = candidates[0];
        let finalImage: string | null = recipeImage || (r as any).image || null;
        if (finalImage && finalImage.startsWith('data:image/')) {
          finalImage = await compressImage(finalImage);
        }
        const { id: _ignoreId, ...data } = (r as any) || {};
        await setDoc(doc(db, 'artifacts', appId, 'users', u.uid, 'favorites', idToWrite), {
          ...data,
          image: finalImage,
          timestamp: Date.now(),
        });

        setCloudFavorites((prev) => {
          if (prev.some((f) => f.id === idToWrite)) return prev;
          const next = [...prev, { ...(r as any), id: idToWrite, image: finalImage, timestamp: Date.now() }];
          writeAccountCache(next);
          return next;
        });
      }
    } catch (err) {
      console.error('Save error', err);
      const debugEnabled = (() => {
        try { return new URLSearchParams(window.location.search).has('debug'); } catch { return false; }
      })();
      if (debugEnabled) {
        const anyErr: any = err as any;
        const code = anyErr?.code ? String(anyErr.code) : '';
        const msg = anyErr?.message ? String(anyErr.message) : '';
        setDebugLastFavoritesWriteError([code, msg].filter(Boolean).join(' | ') || String(err));
      }
      setErrorState(language === 'ru' ? 'Ошибка сохранения.' : 'Failed to update favorites.');
    }
  };

  const isFavorite = (r: Recipe) => {
    const candidates = recipeIdCandidatesFromTitle(r.title);
    return favorites.some((f) => typeof f.id === 'string' && candidates.includes(f.id));
  };

  return {
    favorites,
    guestFavorites,
    cloudFavorites,
    toggleFavorite,
    isFavorite,
    setGuestFavorites,
    setCloudFavorites,
    shouldPreferCloud,
    // debug
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
  };
};
