import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/game-store';
import { useStatsStore } from '../store/stats-store';
import { useHaptics } from './useHaptics';
import { postScore } from '../services/api';

/**
 * Handles local 2P game lifecycle.
 * No AI logic — both players are human.
 * Records results and triggers haptic feedback on game end.
 * Only active when gameMode === 'local'.
 */
export function useLocalGameLoop() {
  const { result, gameMode, moveCount, startTime } = useGameStore();
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

    let scoreResult: 'win' | 'loss' | 'draw' = 'draw';

    if (result.status === 'win') {
      recordLocalResult(result.winner === 'X' ? 'x_win' : 'o_win');
      haptics.success();
      scoreResult = 'win';
    } else if (result.status === 'draw') {
      recordLocalResult('draw');
      haptics.medium();
    }

    // Fire-and-forget score sync
    const durationMs = startTime ? Date.now() - startTime : 0;
    postScore({
      result: scoreResult,
      difficulty: '',
      opponent: 'local',
      move_count: moveCount,
      duration_ms: durationMs,
    });
  }, [result, gameMode]);
}
