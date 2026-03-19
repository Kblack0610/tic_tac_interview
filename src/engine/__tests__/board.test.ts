import { describe, expect, it } from 'vitest';
import {
  applyMove, checkWin, evaluateBoard, getAvailableMoves,
  isBoardFull, opponent,
} from '../board';
import { Board, EMPTY_BOARD, WIN_LINES } from '../types';

describe('checkWin', () => {
  it('returns null for empty board', () => {
    expect(checkWin(EMPTY_BOARD, 'X')).toBeNull();
    expect(checkWin(EMPTY_BOARD, 'O')).toBeNull();
  });

  it.each(WIN_LINES)('detects win for X on line %j', (...line) => {
    const board = [...EMPTY_BOARD] as unknown as Board;
    const mutable = board as unknown as (typeof board[number])[];
    for (const i of line) mutable[i] = 'X';
    expect(checkWin(board, 'X')).toEqual(line);
  });

  it.each(WIN_LINES)('detects win for O on line %j', (...line) => {
    const board = [...EMPTY_BOARD] as unknown as Board;
    const mutable = board as unknown as (typeof board[number])[];
    for (const i of line) mutable[i] = 'O';
    expect(checkWin(board, 'O')).toEqual(line);
  });

  it('does not false-positive on mixed line', () => {
    // X O X across top row
    const board: Board = [
      'X', 'O', 'X',
      null, null, null,
      null, null, null,
    ];
    expect(checkWin(board, 'X')).toBeNull();
    expect(checkWin(board, 'O')).toBeNull();
  });
});

describe('getAvailableMoves', () => {
  it('returns all 9 for empty board', () => {
    expect(getAvailableMoves(EMPTY_BOARD)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('returns none for full board', () => {
    const full: Board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
    expect(getAvailableMoves(full)).toEqual([]);
  });

  it('excludes occupied cells', () => {
    const board: Board = [
      'X', null, null,
      null, 'O', null,
      null, null, null,
    ];
    expect(getAvailableMoves(board)).toEqual([1, 2, 3, 5, 6, 7, 8]);
  });
});

describe('isBoardFull', () => {
  it('returns false for empty board', () => {
    expect(isBoardFull(EMPTY_BOARD)).toBe(false);
  });

  it('returns true for full board', () => {
    const full: Board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
    expect(isBoardFull(full)).toBe(true);
  });
});

describe('applyMove', () => {
  it('places mark at the correct position', () => {
    const result = applyMove(EMPTY_BOARD, 4, 'X');
    expect(result[4]).toBe('X');
  });

  it('does not mutate the original board', () => {
    const before = [...EMPTY_BOARD];
    applyMove(EMPTY_BOARD, 0, 'X');
    expect([...EMPTY_BOARD]).toEqual(before);
  });

  it('throws if cell is occupied', () => {
    const board = applyMove(EMPTY_BOARD, 0, 'X');
    expect(() => applyMove(board, 0, 'O')).toThrow('Cell 0 is already occupied');
  });
});

describe('evaluateBoard', () => {
  it('returns playing for empty board', () => {
    expect(evaluateBoard(EMPTY_BOARD)).toEqual({ status: 'playing' });
  });

  it('returns win for X', () => {
    const board: Board = [
      'X', 'X', 'X',
      'O', 'O', null,
      null, null, null,
    ];
    const result = evaluateBoard(board);
    expect(result.status).toBe('win');
    if (result.status === 'win') {
      expect(result.winner).toBe('X');
      expect(result.line).toEqual([0, 1, 2]);
    }
  });

  it('returns draw for full board with no winner', () => {
    const board: Board = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X',
    ];
    expect(evaluateBoard(board)).toEqual({ status: 'draw' });
  });
});

describe('opponent', () => {
  it('returns O for X', () => expect(opponent('X')).toBe('O'));
  it('returns X for O', () => expect(opponent('O')).toBe('X'));
});
