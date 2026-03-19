import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/game-store';
import { GameWebSocket } from '../services/websocket';
import type { ServerMessage } from '../services/ws-types';
import type { Board, CellIndex, Player, WinLine } from '../engine/types';
import { EMPTY_BOARD } from '../engine/types';

/**
 * Manages WebSocket connection for online multiplayer.
 * Only active when gameMode === 'online'.
 */
export function useOnlineGame() {
  const { gameMode, setOnlineState, applyRemoteMove, resetGame } = useGameStore();
  const wsRef = useRef<GameWebSocket | null>(null);

  const handleMessage = useCallback((msg: ServerMessage) => {
    const store = useGameStore.getState();

    switch (msg.type) {
      case 'room_created':
        setOnlineState({
          roomCode: msg.code,
          playerMark: msg.mark as Player,
        });
        break;

      case 'game_start':
        resetGame();
        setOnlineState({ opponentConnected: true });
        break;

      case 'move_made': {
        // Find the move that was made (diff between current board and server board)
        const lastMove = msg.last_move as CellIndex;
        const serverBoard = msg.board;
        const mark = serverBoard[lastMove];
        if (mark) {
          applyRemoteMove(lastMove, mark as Player);
        }
        break;
      }

      case 'game_over': {
        const lastMove = msg.last_move as CellIndex;
        const serverBoard = msg.board;
        const mark = serverBoard[lastMove];
        if (mark) {
          applyRemoteMove(lastMove, mark as Player);
        }
        break;
      }

      case 'opponent_left':
        setOnlineState({ opponentConnected: false });
        break;

      case 'error':
        // Could surface this to UI via a toast/alert
        console.warn('[WS] Server error:', msg.message);
        break;
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    setOnlineState({ opponentConnected: false });
  }, []);

  useEffect(() => {
    if (gameMode !== 'online') return;

    const ws = new GameWebSocket(handleMessage, handleDisconnect);
    ws.connect();
    wsRef.current = ws;

    // Register move callback so store.playMove can send WS messages
    setOnlineState({ onlineMoveCallback: sendMove });

    return () => {
      ws.close();
      wsRef.current = null;
      setOnlineState({ onlineMoveCallback: null });
    };
  }, [gameMode]);

  const createRoom = useCallback(() => {
    wsRef.current?.send({ type: 'create_room' });
  }, []);

  const joinRoom = useCallback((code: string) => {
    wsRef.current?.send({ type: 'join_room', code: code.toUpperCase() });
  }, []);

  const sendMove = useCallback((cellIndex: CellIndex) => {
    wsRef.current?.send({ type: 'move', cell_index: cellIndex });
  }, []);

  const requestRematch = useCallback(() => {
    wsRef.current?.send({ type: 'rematch' });
  }, []);

  return { createRoom, joinRoom, sendMove, requestRematch };
}
