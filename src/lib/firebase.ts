import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const getFirebaseConfig = () => {
  try {
    if (typeof window.__firebase_config === 'string' && window.__firebase_config) {
      return JSON.parse(window.__firebase_config);
    }
  } catch (e) {
    console.error('Config error', e);
  }
  return { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };
};

export const firebaseConfig = getFirebaseConfig();

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);

export const db = (() => {
  // Some networks/browsers block Firestore's default transport and cause `unavailable`.
  // Force long-polling to maximize compatibility (esp. iOS/WebView/strict proxies).
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      useFetchStreams: false,
    } as any);
  } catch {
    return getFirestore(app);
  }
})();

export const appId =
  (typeof window.__app_id === 'string' && window.__app_id ? window.__app_id : '') ||
  (typeof (firebaseConfig as any)?.projectId === 'string' ? (firebaseConfig as any).projectId : '') ||
  '';
