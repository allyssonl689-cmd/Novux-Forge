import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ThemePreference } from './palette';

interface ThemeState {
  /** Preferência escolhida pelo usuário; 'system' segue o aparelho */
  preference: ThemePreference;
  hasHydrated: boolean;
  setPreference: (preference: ThemePreference) => void;
  /** Alterna rápido entre claro e escuro a partir do modo atualmente resolvido */
  toggleFrom: (currentResolved: 'dark' | 'light') => void;
  setHasHydrated: (v: boolean) => void;
}

/**
 * Preferência de tema persistida. Default 'system' (respeita o aparelho). A
 * troca é global e imediata — todo componente lê as cores via useTheme().
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      hasHydrated: false,
      setPreference: (preference) => set({ preference }),
      toggleFrom: (currentResolved) =>
        set({ preference: currentResolved === 'dark' ? 'light' : 'dark' }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'novux-forge:theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ preference: s.preference }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
