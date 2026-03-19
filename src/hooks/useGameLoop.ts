import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/game-store';
import { useStatsStore } from '../store/stats-store';
import { getAIMove, getThinkingDelay } from '../engine/ai';
import { AI_PLAYER, HUMAN_PLAYER } from '../constants';
import { useHaptics } from './useHaptics';

/**
 * Orchestrates AI turns with artificial thinking delay.
 * Also records game results to stats store.
 */
export function useGameLoop() {
  const {
    board, currentPlayer, result, personality,
    playAIMove, setAIThinking,
  } = useGameStore();
  const { recordWin, recordLoss, recordDraw } = useStatsStore();
  const haptics = useHaptics();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultHandled = useRef(false);

  // AI turn
  useEffect(() => {
    if (result.status !== 'playing') return;
    if (currentPlayer !== AI_PLAYER) return;
    if (!personality) return;

    setAIThinking(true);

    const delay = getThinkingDelay(personality);
    timerRef.current = setTimeout(() => {
      const move = getAIMove(board, AI_PLAYER, personality);
      playAIMove(move);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [board, currentPlayer, result.status, personality]);

  // Record results
  useEffect(() => {
    if (result.status === 'playing') {
      resultHandled.current = false;
      return;
    }
    if (resultHandled.current) return;
    if (!personality) return;

    resultHandled.current = true;

    if (result.status === 'win') {
      if (result.winner === HUMAN_PLAYER) {
        recordWin(personality.difficulty);
        haptics.success();
      } else {
        recordLoss(personality.difficulty);
        haptics.error();
      }
    } else if (result.status === 'draw') {
      recordDraw(personality.difficulty);
      haptics.medium();
    }
  }, [result, personality]);
}
