import { getAvailableMoves } from './board';
import { getBestMove, getRandomMove } from './minimax';
import { AIPersonality, Board, CellIndex, Player } from './types';

/**
 * Get AI move based on personality's optimal rate.
 *
 * - optimalRate = 1.0 → always minimax (unbeatable)
 * - optimalRate = 0.3 → 30% minimax, 70% random
 */
export function getAIMove(
  board: Board,
  aiPlayer: Player,
  personality: AIPersonality,
): CellIndex {
  const moves = getAvailableMoves(board);
  if (moves.length === 0) throw new Error('No available moves');

  // Single move left — no choice needed
  if (moves.length === 1) return moves[0];

  // Roll the dice
  if (Math.random() < personality.optimalRate) {
    return getBestMove(board, aiPlayer);
  }

  return getRandomMove(board);
}

/**
 * Calculate a random thinking delay within the personality's range.
 */
export function getThinkingDelay(personality: AIPersonality): number {
  const [min, max] = personality.thinkingDelay;
  return min + Math.random() * (max - min);
}
