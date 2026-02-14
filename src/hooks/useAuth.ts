import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

/**
 * Initialize Firebase auth on mount, return cleanup.
 * Call once in the root component.
 */
export const useAuth = () => {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    const unsub = initAuth();
    return unsub;
  }, [initAuth]);
};
