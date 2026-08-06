import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ReminderState {
  enabled: boolean;
  hour: number;
  minute: number;
  setEnabled: (enabled: boolean) => void;
  setTime: (hour: number, minute: number) => void;
}

/** Preferência do lembrete diário de treino — default ligado, 08:00 */
export const useReminderStore = create<ReminderState>()(
  persist(
    (set) => ({
      enabled: true,
      hour: 8,
      minute: 0,
      setEnabled: (enabled) => set({ enabled }),
      setTime: (hour, minute) => set({ hour, minute }),
    }),
    {
      name: 'novux-forge:workout-reminder',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
