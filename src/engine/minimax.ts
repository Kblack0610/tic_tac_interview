import { applyMove, checkWin, getAvailableMoves, isBoardFull } from './board';
import { Board, CellIndex, Player } from './types';

/**
 * Minimax with alpha-beta pruning.
 * Returns the best move index for the given player.
 *
 * The AI is always the maximizing player, regardless of mark.
 */
export function minimax(
  board: Board,
  aiPlayer: Player,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  depth: number,
): number {
  const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';

  // Terminal states
  if (checkWin(board, aiPlayer)) return 10 - depth;
  if (checkWin(board, humanPlayer)) return depth - 10;
  if (isBoardFull(board)) return 0;

  const moves = getAvailableMoves(board);

  if (isMaximizing) {
    let best = -Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move, aiPlayer);
      const score = minimax(newBoard, aiPlayer, false, alpha, beta, depth + 1);
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move, humanPlayer);
      const score = minimax(newBoard, aiPlayer, true, alpha, beta, depth + 1);
      best = Math.min(best, score);
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

/** Get the best move for the AI player using full minimax + alpha-beta. */
export function getBestMove(board: Board, aiPlayer: Player): CellIndex {
  const moves = getAvailableMoves(board);
  if (moves.length === 0) throw new Error('No available moves');

  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    const newBoard = applyMove(board, move, aiPlayer);
    const score = minimax(newBoard, aiPlayer, false, -Infinity, Infinity, 0);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

/** Get a random move from available cells. */
export function getRandomMove(board: Board): CellIndex {
  const moves = getAvailableMoves(board);
  if (moves.length === 0) throw new Error('No available moves');
  return moves[Math.floor(Math.random() * moves.length)];
}
