import { create } from 'zustand';
import type { Diet, Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';

interface AppState {
  language: Language;
  diet: Diet;
  showSettings: boolean;
  showAuth: boolean;
  errorState: string | null;
  isMealLoading: boolean;

  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  setDiet: (diet: Diet) => void;
  setShowSettings: (show: boolean) => void;
  toggleSettings: () => void;
  setShowAuth: (show: boolean) => void;
  toggleAuth: () => void;
  setErrorState: (error: string | null) => void;
  clearError: () => void;
  setIsMealLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'ru',
  diet: 'none',
  showSettings: false,
  showAuth: false,
  errorState: null,
  isMealLoading: false,

  setLanguage: (language) => set({ language }),
  toggleLanguage: () => set((s) => ({ language: s.language === 'ru' ? 'en' : 'ru' })),
  setDiet: (diet) => set({ diet }),
  setShowSettings: (showSettings) => set({ showSettings }),
  toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),
  setShowAuth: (showAuth) => set({ showAuth }),
  toggleAuth: () => set((s) => ({ showAuth: !s.showAuth })),
  setErrorState: (errorState) => set({ errorState }),
  clearError: () => set({ errorState: null }),
  setIsMealLoading: (isMealLoading) => set({ isMealLoading }),
}));

/** Helper: get translations for current language */
export const useTranslations = () => {
  const language = useAppStore((s) => s.language);
  return TRANSLATIONS[language];
};

export const useDebugEnabled = () => {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).has('debug');
  } catch {
    return false;
  }
};
