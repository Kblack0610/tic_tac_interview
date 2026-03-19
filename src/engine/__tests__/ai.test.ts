import { describe, expect, it } from 'vitest';
import { getAIMove, getThinkingDelay } from '../ai';
import { LUCKY, SHARP, THE_HOUSE } from '../ai-personalities';
import { applyMove, evaluateBoard, getAvailableMoves } from '../board';
import { Board, EMPTY_BOARD, Player } from '../types';

describe('getAIMove', () => {
  it('returns a valid move for each personality', () => {
    for (const personality of [LUCKY, SHARP, THE_HOUSE]) {
      const move = getAIMove(EMPTY_BOARD, 'O', personality);
      expect(getAvailableMoves(EMPTY_BOARD)).toContain(move);
    }
  });

  it('The House (unbeatable) never loses in 50 games', () => {
    for (let game = 0; game < 50; game++) {
      let board: Board = EMPTY_BOARD;
      let currentPlayer: Player = 'X';

      while (true) {
        const result = evaluateBoard(board);
        if (result.status !== 'playing') {
          if (result.status === 'win') {
            expect(result.winner).toBe('O'); // House is O
          }
          break;
        }

        if (currentPlayer === 'O') {
          const move = getAIMove(board, 'O', THE_HOUSE);
          board = applyMove(board, move, 'O');
        } else {
          const moves = getAvailableMoves(board);
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          board = applyMove(board, randomMove, 'X');
        }
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      }
    }
  });

  it('returns the only available move', () => {
    const board: Board = [
      'X', 'O', 'X',
      'O', 'X', 'O',
      'O', 'X', null,
    ];
    expect(getAIMove(board, 'O', LUCKY)).toBe(8);
  });
});

describe('getThinkingDelay', () => {
  it('returns a value within the personality range', () => {
    for (let i = 0; i < 20; i++) {
      const delay = getThinkingDelay(LUCKY);
      expect(delay).toBeGreaterThanOrEqual(LUCKY.thinkingDelay[0]);
      expect(delay).toBeLessThanOrEqual(LUCKY.thinkingDelay[1]);
    }
  });
});
