/** Board sizing */
export const BOARD_SIZE = 3;
export const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;

/** Layout */
export const BOARD_PADDING = 8;
export const CELL_GAP = 6;
export const GRID_LINE_WIDTH = 3;

/** SVG mark sizing (relative to cell) */
export const MARK_PADDING_RATIO = 0.22;
export const MARK_STROKE_WIDTH = 6;

/** AI turn */
export const AI_TURN_MIN_DELAY = 300;

/** Game */
export const HUMAN_PLAYER = 'X' as const;
export const AI_PLAYER = 'O' as const;

/** Backend API */
export const API_BASE_URL =
  typeof __DEV__ !== 'undefined' && __DEV__
    ? 'http://localhost:8080'
    : 'https://cheddr-api.kblab.me';
