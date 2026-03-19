import { describe, expect, it } from 'vitest';
import { getBestMove, getRandomMove } from '../minimax';
import { applyMove, evaluateBoard, getAvailableMoves } from '../board';
import { Board, EMPTY_BOARD, Player } from '../types';

describe('getBestMove', () => {
  it('takes the winning move when available', () => {
    // O can win by playing position 2
    const board: Board = [
      'X', 'X', null,
      'O', 'O', null,
      null, null, null,
    ];
    // If AI is O, it should take 5 to win (O O _)
    expect(getBestMove(board, 'O')).toBe(5);
  });

  it('blocks opponent winning move', () => {
    // X has two in a row (0,1), O must block at 2
    const board: Board = [
      'X', 'X', null,
      'O', null, null,
      null, null, null,
    ];
    expect(getBestMove(board, 'O')).toBe(2);
  });

  it('takes center on empty board', () => {
    const move = getBestMove(EMPTY_BOARD, 'X');
    // Center (4) or corner (0,2,6,8) are optimal
    expect([0, 2, 4, 6, 8]).toContain(move);
  });

  it('never loses as X in 100 random games', () => {
    for (let game = 0; game < 100; game++) {
      let board: Board = EMPTY_BOARD;
      let currentPlayer: Player = 'X';

      while (true) {
        const result = evaluateBoard(board);
        if (result.status !== 'playing') {
          // AI (X) should never lose
          if (result.status === 'win') {
            expect(result.winner).toBe('X');
          }
          break;
        }

        if (currentPlayer === 'X') {
          // AI plays optimally
          const move = getBestMove(board, 'X');
          board = applyMove(board, move, 'X');
        } else {
          // Opponent plays randomly
          const moves = getAvailableMoves(board);
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          board = applyMove(board, randomMove, 'O');
        }
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      }
    }
  });

  it('never loses as O in 100 random games', () => {
    for (let game = 0; game < 100; game++) {
      let board: Board = EMPTY_BOARD;
      let currentPlayer: Player = 'X';

      while (true) {
        const result = evaluateBoard(board);
        if (result.status !== 'playing') {
          // AI (O) should never lose
          if (result.status === 'win') {
            expect(result.winner).toBe('O');
          }
          break;
        }

        if (currentPlayer === 'O') {
          const move = getBestMove(board, 'O');
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
});

describe('getRandomMove', () => {
  it('returns a valid move', () => {
    const move = getRandomMove(EMPTY_BOARD);
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThanOrEqual(8);
  });

  it('throws on full board', () => {
    const full: Board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
    expect(() => getRandomMove(full)).toThrow('No available moves');
  });
});
