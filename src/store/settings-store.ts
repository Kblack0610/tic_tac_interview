import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsStore {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  toggleSound: () => void;
  toggleHaptics: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      soundEnabled: true,
      hapticsEnabled: true,
      toggleSound: () => set({ soundEnabled: !get().soundEnabled }),
      toggleHaptics: () => set({ hapticsEnabled: !get().hapticsEnabled }),
    }),
    {
      name: 'cheddr-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
