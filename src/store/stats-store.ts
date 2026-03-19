import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Difficulty } from '../engine/types';

interface DifficultyStats {
  wins: number;
  losses: number;
  draws: number;
}

interface StatsStore {
  stats: Record<Difficulty, DifficultyStats>;
  totalGames: number;

  recordWin: (difficulty: Difficulty) => void;
  recordLoss: (difficulty: Difficulty) => void;
  recordDraw: (difficulty: Difficulty) => void;
  resetStats: () => void;
}

const emptyStats = (): Record<Difficulty, DifficultyStats> => ({
  easy: { wins: 0, losses: 0, draws: 0 },
  medium: { wins: 0, losses: 0, draws: 0 },
  hard: { wins: 0, losses: 0, draws: 0 },
});

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      stats: emptyStats(),
      totalGames: 0,

      recordWin: (difficulty) =>
        set((state) => ({
          stats: {
            ...state.stats,
            [difficulty]: {
              ...state.stats[difficulty],
              wins: state.stats[difficulty].wins + 1,
            },
          },
          totalGames: state.totalGames + 1,
        })),

      recordLoss: (difficulty) =>
        set((state) => ({
          stats: {
            ...state.stats,
            [difficulty]: {
              ...state.stats[difficulty],
              losses: state.stats[difficulty].losses + 1,
            },
          },
          totalGames: state.totalGames + 1,
        })),

      recordDraw: (difficulty) =>
        set((state) => ({
          stats: {
            ...state.stats,
            [difficulty]: {
              ...state.stats[difficulty],
              draws: state.stats[difficulty].draws + 1,
            },
          },
          totalGames: state.totalGames + 1,
        })),

      resetStats: () =>
        set({ stats: emptyStats(), totalGames: 0 }),
    }),
    {
      name: 'cheddr-stats',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
