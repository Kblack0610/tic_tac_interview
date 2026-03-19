/** Cell value: X, O, or empty */
export type Player = 'X' | 'O';
export type CellValue = Player | null;

/** 9-cell board as a tuple */
export type Board = readonly [
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue,
];

/** Board index 0-8 */
export type CellIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** Three-cell winning line */
export type WinLine = readonly [CellIndex, CellIndex, CellIndex];

/** All possible winning lines */
export const WIN_LINES: readonly WinLine[] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diagonals
] as const;

/** Discriminated union for game result */
export type GameResult =
  | { status: 'playing' }
  | { status: 'win'; winner: Player; line: WinLine }
  | { status: 'draw' };

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface AIPersonality {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly difficulty: Difficulty;
  readonly description: string;
  readonly taunts: {
    readonly onThinking: readonly string[];
    readonly onWin: readonly string[];
    readonly onLose: readonly string[];
    readonly onDraw: readonly string[];
  };
  /** 0-1: probability of choosing the optimal minimax move */
  readonly optimalRate: number;
  /** Milliseconds range for fake "thinking" delay */
  readonly thinkingDelay: readonly [min: number, max: number];
}

export type GameMode = 'ai' | 'local' | 'online';

export const EMPTY_BOARD: Board = [
  null, null, null,
  null, null, null,
  null, null, null,
];
