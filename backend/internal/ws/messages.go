package ws

// ClientMessage is sent from client to server.
type ClientMessage struct {
	Type      string `json:"type"`
	Code      string `json:"code,omitempty"`       // for join_room
	CellIndex int    `json:"cell_index,omitempty"` // for move
}

// ServerMessage is sent from server to client.
type ServerMessage struct {
	Type     string `json:"type"`
	Code     string `json:"code,omitempty"`       // room code
	Mark     string `json:"mark,omitempty"`        // X or O assignment
	Board    [9]*string `json:"board,omitempty"`    // current board state
	Turn     string `json:"turn,omitempty"`         // whose turn
	LastMove int    `json:"last_move,omitempty"`    // last move index
	Result   string `json:"result,omitempty"`       // win, draw
	Winner   string `json:"winner,omitempty"`       // X or O
	WinLine  []int  `json:"win_line,omitempty"`     // winning cells
	Message  string `json:"message,omitempty"`      // error/info message
}

// Message types
const (
	// Client → Server
	MsgCreateRoom = "create_room"
	MsgJoinRoom   = "join_room"
	MsgMove       = "move"
	MsgRematch    = "rematch"

	// Server → Client
	MsgRoomCreated    = "room_created"
	MsgGameStart      = "game_start"
	MsgMoveMade       = "move_made"
	MsgGameOver       = "game_over"
	MsgOpponentLeft   = "opponent_left"
	MsgError          = "error"
	MsgWaitingForPeer = "waiting_for_peer"
)
