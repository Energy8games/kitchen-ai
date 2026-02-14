import React from 'react';
import { collection, getDocsFromServer } from 'firebase/firestore';
import { useAppStore, useTranslations, useDebugEnabled } from '../../stores/useAppStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { db, appId, firebaseConfig } from '../../lib/firebase';
import type { Diet, FavoriteRecipe } from '../../types';

interface SettingsPanelProps {
  cloudFavorites: FavoriteRecipe[];
  guestFavorites: FavoriteRecipe[];
  shouldPreferCloud: boolean;
  // Debug
  debugServerFavoritesCount: number | null;
  setDebugServerFavoritesCount: (v: number | null) => void;
  debugServerFavoritesError: string | null;
  setDebugServerFavoritesError: (v: string | null) => void;
  debugLastFavoritesWriteError: string | null;
  debugProbeResult: string | null;
  setDebugProbeResult: (v: string | null) => void;
  debugChannelProbeResult: string | null;
  setDebugChannelProbeResult: (v: string | null) => void;
  debugRestListResult: string | null;
  setDebugRestListResult: (v: string | null) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  cloudFavorites,
  guestFavorites,
  shouldPreferCloud,
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
}) => {
  const showSettings = useAppStore((s) => s.showSettings);
  const diet = useAppStore((s) => s.diet);
  const setDiet = useAppStore((s) => s.setDiet);
  const setShowSettings = useAppStore((s) => s.setShowSettings);
  const t = useTranslations();
  const debugEnabled = useDebugEnabled();

  const effectiveUser = useAuthStore((s) => s.getEffectiveUser)();
  const isAccountUser = useAuthStore((s) => s.getIsAccountUser)();

  if (!showSettings) return null;

  return (
    <div className="max-w-md mx-auto mt-4 p-6 bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-black/[0.03] animate-in slide-in-from-top-4 mx-6 lg:mx-auto relative z-[70]">
      <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-5">{t.settings.title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {(['none', 'vegan', 'keto', 'glutenFree'] as Diet[]).map((d) => (
          <button
            key={d}
            onClick={() => {
              setDiet(d);
              setShowSettings(false);
            }}
            className={`px-4 py-3 rounded-[1.2rem] text-xs font-bold transition-all ${
              diet === d ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.settings[d]}
          </button>
        ))}
      </div>

      {debugEnabled && (
        <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-600 break-all">
          <div className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">Debug</div>
          <div>projectId: {(firebaseConfig as any)?.projectId || '—'}</div>
          <div>appId(artifacts): {appId || '—'}</div>
          <div>online: {typeof navigator !== 'undefined' ? String(navigator.onLine) : '—'}</div>
          <div>mode: {isAccountUser ? 'account' : 'guest'}</div>
          <div>uid: {effectiveUser?.uid || '—'}</div>
          <div>
            providers:{' '}
            {effectiveUser?.providerData?.length
              ? effectiveUser.providerData
                  .map((p) => p.providerId)
                  .filter(Boolean)
                  .join(', ')
              : '—'}
          </div>
          <div>
            favorites: cloud={cloudFavorites.length} guest={guestFavorites.length} using={shouldPreferCloud ? 'cloud' : 'guest'}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-100 transition-all"
              onClick={async () => {
                setDebugServerFavoritesError(null);
                setDebugServerFavoritesCount(null);
                try {
                  if (!appId || !effectiveUser?.uid) throw new Error('Missing appId/uid');
                  const snap = await getDocsFromServer(
                    collection(db, 'artifacts', appId, 'users', effectiveUser.uid, 'favorites'),
                  );
                  setDebugServerFavoritesCount(snap.size);
                } catch (e: any) {
                  const code = e?.code ? String(e.code) : '';
                  const msg = e?.message ? String(e.message) : '';
                  setDebugServerFavoritesError([code, msg].filter(Boolean).join(' | ') || String(e));
                }
              }}
            >
              Server refresh
            </button>
            <div>
              serverFavorites: {debugServerFavoritesCount === null ? '—' : debugServerFavoritesCount}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-100 transition-all"
              onClick={async () => {
                setDebugProbeResult(null);
                try {
                  const t0 = performance.now();
                  await fetch('https://firestore.googleapis.com/', { mode: 'no-cors', cache: 'no-store' });
                  const ms = Math.round(performance.now() - t0);
                  setDebugProbeResult(`firestore.googleapis.com: OK (~${ms}ms)`);
                } catch (e: any) {
                  const msg = e?.message ? String(e.message) : String(e);
                  setDebugProbeResult(`firestore.googleapis.com: FAIL | ${msg}`);
                }
              }}
            >
              Network probe
            </button>
            <div>probe: {debugProbeResult || '—'}</div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-100 transition-all"
              onClick={async () => {
                setDebugChannelProbeResult(null);
                try {
                  const t0 = performance.now();
                  await fetch('https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel', {
                    mode: 'no-cors',
                    cache: 'no-store',
                  });
                  const ms = Math.round(performance.now() - t0);
                  setDebugChannelProbeResult(`Listen/channel: OK (~${ms}ms)`);
                } catch (e: any) {
                  const msg = e?.message ? String(e.message) : String(e);
                  setDebugChannelProbeResult(`Listen/channel: FAIL | ${msg}`);
                }
              }}
            >
              Channel probe
            </button>
            <div>channel: {debugChannelProbeResult || '—'}</div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-100 transition-all"
              onClick={async () => {
                setDebugRestListResult(null);
                try {
                  const projectId = (firebaseConfig as any)?.projectId as string | undefined;
                  if (!projectId) throw new Error('Missing projectId');
                  if (!appId || !effectiveUser?.uid) throw new Error('Missing appId/uid');
                  if (!effectiveUser?.getIdToken) throw new Error('Missing getIdToken');

                  const token = await (effectiveUser as any).getIdToken();
                  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
                    projectId,
                  )}/databases/(default)/documents/artifacts/${encodeURIComponent(
                    appId,
                  )}/users/${encodeURIComponent(effectiveUser.uid)}/favorites?pageSize=50`;

                  const res = await fetch(url, {
                    method: 'GET',
                    cache: 'no-store',
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });

                  if (!res.ok) {
                    const text = await res.text().catch(() => '');
                    setDebugRestListResult(`REST: HTTP ${res.status} | ${text || '(no body)'}`);
                    return;
                  }

                  const json: any = await res.json().catch(() => ({}));
                  const count = Array.isArray(json?.documents) ? json.documents.length : 0;
                  setDebugRestListResult(`REST: OK | documents=${count}`);
                } catch (e: any) {
                  const msg = e?.message ? String(e.message) : String(e);
                  setDebugRestListResult(`REST: FAIL | ${msg}`);
                }
              }}
            >
              REST list
            </button>
            <div>rest: {debugRestListResult || '—'}</div>
          </div>
          {debugServerFavoritesError && <div className="mt-1 text-rose-600">serverError: {debugServerFavoritesError}</div>}
          {debugLastFavoritesWriteError && <div className="mt-1 text-rose-600">lastWriteError: {debugLastFavoritesWriteError}</div>}
          <div>
            path:{' '}
            {appId && effectiveUser?.uid
              ? `artifacts/${appId}/users/${effectiveUser.uid}/favorites`
              : '—'}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
