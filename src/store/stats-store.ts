import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Difficulty } from '../engine/types';

interface DifficultyStats {
  wins: number;
  losses: number;
  draws: number;
}

interface LocalStats {
  xWins: number;
  oWins: number;
  draws: number;
}

type LocalResult = 'x_win' | 'o_win' | 'draw';

interface StatsStore {
  stats: Record<Difficulty, DifficultyStats>;
  localStats: LocalStats;
  totalGames: number;

  recordWin: (difficulty: Difficulty) => void;
  recordLoss: (difficulty: Difficulty) => void;
  recordDraw: (difficulty: Difficulty) => void;
  recordLocalResult: (result: LocalResult) => void;
  resetStats: () => void;
}

const emptyStats = (): Record<Difficulty, DifficultyStats> => ({
  easy: { wins: 0, losses: 0, draws: 0 },
  medium: { wins: 0, losses: 0, draws: 0 },
  hard: { wins: 0, losses: 0, draws: 0 },
});

const emptyLocalStats = (): LocalStats => ({
  xWins: 0,
  oWins: 0,
  draws: 0,
});

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      stats: emptyStats(),
      localStats: emptyLocalStats(),
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

      recordLocalResult: (result) =>
        set((state) => ({
          localStats: {
            ...state.localStats,
            xWins: state.localStats.xWins + (result === 'x_win' ? 1 : 0),
            oWins: state.localStats.oWins + (result === 'o_win' ? 1 : 0),
            draws: state.localStats.draws + (result === 'draw' ? 1 : 0),
          },
          totalGames: state.totalGames + 1,
        })),

      resetStats: () =>
        set({ stats: emptyStats(), localStats: emptyLocalStats(), totalGames: 0 }),
    }),
    {
      name: 'cheddr-stats',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
