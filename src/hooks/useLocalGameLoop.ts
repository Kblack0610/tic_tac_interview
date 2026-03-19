import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/game-store';
import { useStatsStore } from '../store/stats-store';
import { useHaptics } from './useHaptics';

/**
 * Handles local 2P game lifecycle.
 * No AI logic — both players are human.
 * Records results and triggers haptic feedback on game end.
 * Only active when gameMode === 'local'.
 */
export function useLocalGameLoop() {
  const { result, gameMode } = useGameStore();
  const { recordLocalResult } = useStatsStore();
  const haptics = useHaptics();
  const resultHandled = useRef(false);

  useEffect(() => {
    if (gameMode !== 'local') return;
    if (result.status === 'playing') {
      resultHandled.current = false;
      return;
    }
    if (resultHandled.current) return;

    resultHandled.current = true;

    if (result.status === 'win') {
      recordLocalResult(result.winner === 'X' ? 'x_win' : 'o_win');
      haptics.success();
    } else if (result.status === 'draw') {
      recordLocalResult('draw');
      haptics.medium();
    }
  }, [result, gameMode]);
}
