import { create } from 'zustand';
import {
  AIPersonality, Board, CellIndex, EMPTY_BOARD,
  GameResult, Player,
} from '../engine/types';
import { GameMode } from '../engine/types';
import { applyMove, evaluateBoard, opponent } from '../engine/board';
import { AI_PLAYER, HUMAN_PLAYER } from '../constants';

interface GameStore {
  board: Board;
  currentPlayer: Player;
  result: GameResult;
  moveCount: number;
  personality: AIPersonality | null;
  isAIThinking: boolean;
  lastMove: CellIndex | null;
  gameMode: GameMode;
  startTime: number | null;

  // Online multiplayer state
  roomCode: string | null;
  playerMark: Player | null;
  opponentConnected: boolean;
  onlineMoveCallback: ((index: CellIndex) => void) | null;

  // Actions
  setPersonality: (personality: AIPersonality) => void;
  setGameMode: (mode: GameMode) => void;
  playMove: (index: CellIndex) => void;
  playMoveForPlayer: (index: CellIndex, player: Player) => void;
  applyRemoteMove: (index: CellIndex, player: Player) => void;
  setAIThinking: (thinking: boolean) => void;
  resetGame: () => void;
  setOnlineState: (state: { roomCode?: string | null; playerMark?: Player | null; opponentConnected?: boolean; onlineMoveCallback?: ((index: CellIndex) => void) | null }) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  board: EMPTY_BOARD,
  currentPlayer: HUMAN_PLAYER,
  result: { status: 'playing' },
  moveCount: 0,
  personality: null,
  isAIThinking: false,
  lastMove: null,
  gameMode: 'ai',
  startTime: null,

  // Online state
  roomCode: null,
  playerMark: null,
  opponentConnected: false,
  onlineMoveCallback: null,

  setPersonality: (personality) => set({ personality }),
  setGameMode: (mode) => set({ gameMode: mode }),

  playMove: (index) => {
    const { board, currentPlayer, result, gameMode } = get();
    if (result.status !== 'playing') return;
    if (board[index] !== null) return;

    if (gameMode === 'ai') {
      if (currentPlayer !== HUMAN_PLAYER) return;
      const newBoard = applyMove(board, index, HUMAN_PLAYER);
      const newResult = evaluateBoard(newBoard);
      set({
        board: newBoard,
        currentPlayer: AI_PLAYER,
        result: newResult,
        moveCount: get().moveCount + 1,
        lastMove: index,
      });
    } else if (gameMode === 'local') {
      const newBoard = applyMove(board, index, currentPlayer);
      const newResult = evaluateBoard(newBoard);
      set({
        board: newBoard,
        currentPlayer: opponent(currentPlayer),
        result: newResult,
        moveCount: get().moveCount + 1,
        lastMove: index,
      });
    } else if (gameMode === 'online') {
      const { playerMark, onlineMoveCallback } = get();
      if (currentPlayer !== playerMark) return;
      onlineMoveCallback?.(index);
    }
  },

  playMoveForPlayer: (index, player) => {
    const { board, result } = get();
    if (result.status !== 'playing') return;
    if (board[index] !== null) return;

    const newBoard = applyMove(board, index, player);
    const newResult = evaluateBoard(newBoard);

    set({
      board: newBoard,
      currentPlayer: opponent(player),
      result: newResult,
      moveCount: get().moveCount + 1,
      isAIThinking: false,
      lastMove: index,
    });
  },

  applyRemoteMove: (index, player) => {
    const { board, result } = get();
    if (result.status !== 'playing') return;
    if (board[index] !== null) return;

    const newBoard = applyMove(board, index, player);
    const newResult = evaluateBoard(newBoard);

    set({
      board: newBoard,
      currentPlayer: opponent(player),
      result: newResult,
      moveCount: get().moveCount + 1,
      lastMove: index,
    });
  },

  setAIThinking: (thinking) => set({ isAIThinking: thinking }),

  resetGame: () =>
    set({
      board: EMPTY_BOARD,
      currentPlayer: HUMAN_PLAYER,
      result: { status: 'playing' },
      moveCount: 0,
      isAIThinking: false,
      lastMove: null,
      startTime: Date.now(),
    }),

  setOnlineState: (state) => set(state),
}));
