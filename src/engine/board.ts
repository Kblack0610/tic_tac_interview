import {
  Board, CellIndex, CellValue, GameResult, Player, WIN_LINES, WinLine,
} from './types';

/** Check if a player has won. Returns the winning line or null. */
export function checkWin(board: Board, player: Player): WinLine | null {
  for (const line of WIN_LINES) {
    if (line.every((i) => board[i] === player)) {
      return line;
    }
  }
  return null;
}

/** Get all empty cell indices. */
export function getAvailableMoves(board: Board): CellIndex[] {
  const moves: CellIndex[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      moves.push(i as CellIndex);
    }
  }
  return moves;
}

/** Check if the board is full. */
export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

/** Place a mark on the board. Returns a new board (immutable). */
export function applyMove(board: Board, index: CellIndex, player: Player): Board {
  if (board[index] !== null) {
    throw new Error(`Cell ${index} is already occupied by ${board[index]}`);
  }
  const next = [...board] as unknown as [
    CellValue, CellValue, CellValue,
    CellValue, CellValue, CellValue,
    CellValue, CellValue, CellValue,
  ];
  next[index] = player;
  return next;
}

/** Evaluate the board and return the game result. */
export function evaluateBoard(board: Board): GameResult {
  const xWin = checkWin(board, 'X');
  if (xWin) return { status: 'win', winner: 'X', line: xWin };

  const oWin = checkWin(board, 'O');
  if (oWin) return { status: 'win', winner: 'O', line: oWin };

  if (isBoardFull(board)) return { status: 'draw' };

  return { status: 'playing' };
}

/** Get the opponent player. */
export function opponent(player: Player): Player {
  return player === 'X' ? 'O' : 'X';
}
