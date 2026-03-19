import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/game-store';
import { useStatsStore } from '../store/stats-store';
import { getAIMove, getThinkingDelay } from '../engine/ai';
import { AI_PLAYER, HUMAN_PLAYER } from '../constants';
import { useHaptics } from './useHaptics';
import { postScore } from '../services/api';

/**
 * Orchestrates AI turns with artificial thinking delay.
 * Also records game results to stats store and syncs to backend.
 * Only active when gameMode === 'ai'.
 */
export function useGameLoop() {
  const {
    board, currentPlayer, result, personality, gameMode, moveCount, startTime,
    playMoveForPlayer, setAIThinking,
  } = useGameStore();
  const { recordWin, recordLoss, recordDraw } = useStatsStore();
  const haptics = useHaptics();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultHandled = useRef(false);

  // AI turn
  useEffect(() => {
    if (gameMode !== 'ai') return;
    if (result.status !== 'playing') return;
    if (currentPlayer !== AI_PLAYER) return;
    if (!personality) return;

    setAIThinking(true);

    const delay = getThinkingDelay(personality);
    timerRef.current = setTimeout(() => {
      const move = getAIMove(board, AI_PLAYER, personality);
      playMoveForPlayer(move, AI_PLAYER);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [board, currentPlayer, result.status, personality, gameMode]);

  // Record results
  useEffect(() => {
    if (gameMode !== 'ai') return;
    if (result.status === 'playing') {
      resultHandled.current = false;
      return;
    }
    if (resultHandled.current) return;
    if (!personality) return;

    resultHandled.current = true;

    let scoreResult: 'win' | 'loss' | 'draw' = 'draw';

    if (result.status === 'win') {
      if (result.winner === HUMAN_PLAYER) {
        recordWin(personality.difficulty);
        haptics.success();
        scoreResult = 'win';
      } else {
        recordLoss(personality.difficulty);
        haptics.error();
        scoreResult = 'loss';
      }
    } else if (result.status === 'draw') {
      recordDraw(personality.difficulty);
      haptics.medium();
    }

    // Fire-and-forget score sync
    const durationMs = startTime ? Date.now() - startTime : 0;
    postScore({
      result: scoreResult,
      difficulty: personality.difficulty,
      opponent: personality.id,
      move_count: moveCount,
      duration_ms: durationMs,
    });
  }, [result, personality, gameMode]);
}
