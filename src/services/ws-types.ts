/** Client → Server messages */
export type ClientMessage =
  | { type: 'create_room' }
  | { type: 'join_room'; code: string }
  | { type: 'move'; cell_index: number }
  | { type: 'rematch' };

/** Server → Client messages */
export type ServerMessage =
  | { type: 'room_created'; code: string; mark: 'X' | 'O' }
  | { type: 'game_start'; board: (string | null)[]; turn: string }
  | { type: 'move_made'; board: (string | null)[]; turn: string; last_move: number }
  | { type: 'game_over'; board: (string | null)[]; last_move: number; result: 'win' | 'draw'; winner?: string; win_line?: number[] }
  | { type: 'opponent_left' }
  | { type: 'error'; message: string }
  | { type: 'waiting_for_peer' };
