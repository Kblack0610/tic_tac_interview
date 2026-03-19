import { create } from 'zustand';
import {
  AIPersonality, Board, CellIndex, EMPTY_BOARD,
  GameResult, Player,
} from '../engine/types';
import { applyMove, evaluateBoard } from '../engine/board';
import { AI_PLAYER, HUMAN_PLAYER } from '../constants';

interface GameStore {
  board: Board;
  currentPlayer: Player;
  result: GameResult;
  moveCount: number;
  personality: AIPersonality | null;
  isAIThinking: boolean;
  lastMove: CellIndex | null;

  // Actions
  setPersonality: (personality: AIPersonality) => void;
  playMove: (index: CellIndex) => void;
  playAIMove: (index: CellIndex) => void;
  setAIThinking: (thinking: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  board: EMPTY_BOARD,
  currentPlayer: HUMAN_PLAYER,
  result: { status: 'playing' },
  moveCount: 0,
  personality: null,
  isAIThinking: false,
  lastMove: null,

  setPersonality: (personality) => set({ personality }),

  playMove: (index) => {
    const { board, currentPlayer, result } = get();
    if (result.status !== 'playing') return;
    if (board[index] !== null) return;
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
  },

  playAIMove: (index) => {
    const { board, result } = get();
    if (result.status !== 'playing') return;
    if (board[index] !== null) return;

    const newBoard = applyMove(board, index, AI_PLAYER);
    const newResult = evaluateBoard(newBoard);

    set({
      board: newBoard,
      currentPlayer: HUMAN_PLAYER,
      result: newResult,
      moveCount: get().moveCount + 1,
      isAIThinking: false,
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
    }),
}));
