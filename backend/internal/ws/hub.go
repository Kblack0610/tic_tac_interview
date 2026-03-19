package ws

import (
	"context"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"nhooyr.io/websocket"

	"github.com/kblack0610/cheddr-tictactoe-api/internal/models"
	"github.com/kblack0610/cheddr-tictactoe-api/internal/store"
)

const (
	roomCodeLength = 4
	roomTimeout    = 30 * time.Minute
	codeChars      = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no ambiguous chars
)

type Room struct {
	code      string
	players   [2]*Client
	board     [9]string // "", "X", "O"
	turn      string    // "X" or "O"
	moveCount int
	gameOver  bool
	createdAt time.Time
	mu        sync.Mutex
}

type Hub struct {
	store      *store.Store
	rooms      map[string]*Room
	mu         sync.RWMutex
	unregister chan *Client
}

func NewHub(s *store.Store) *Hub {
	return &Hub{
		store:      s,
		rooms:      make(map[string]*Room),
		unregister: make(chan *Client, 16),
	}
}

func (h *Hub) Run() {
	// Cleanup ticker for stale rooms
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case client := <-h.unregister:
			h.handleDisconnect(client)
		case <-ticker.C:
			h.cleanupStaleRooms()
		}
	}
}

func (h *Hub) HandleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		OriginPatterns: []string{"*"},
	})
	if err != nil {
		log.Printf("ws accept: %v", err)
		return
	}

	client := newClient(h, conn)
	// Use a background context so the WS isn't tied to the HTTP request lifecycle
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go client.writePump(ctx)
	client.readPump(ctx)
}

func (h *Hub) handleMessage(c *Client, msg ClientMessage) {
	switch msg.Type {
	case MsgCreateRoom:
		h.createRoom(c)
	case MsgJoinRoom:
		h.joinRoom(c, msg.Code)
	case MsgMove:
		h.handleMove(c, msg.CellIndex)
	case MsgRematch:
		h.handleRematch(c)
	default:
		c.sendMsg(ServerMessage{Type: MsgError, Message: "unknown message type"})
	}
}

func (h *Hub) createRoom(c *Client) {
	if c.room != nil {
		c.sendMsg(ServerMessage{Type: MsgError, Message: "already in a room"})
		return
	}

	code := h.generateCode()
	room := &Room{
		code:      code,
		turn:      "X",
		createdAt: time.Now(),
	}
	room.players[0] = c
	c.room = room
	c.mark = "X"

	h.mu.Lock()
	h.rooms[code] = room
	h.mu.Unlock()

	c.sendMsg(ServerMessage{
		Type: MsgRoomCreated,
		Code: code,
		Mark: "X",
	})
}

func (h *Hub) joinRoom(c *Client, code string) {
	if c.room != nil {
		c.sendMsg(ServerMessage{Type: MsgError, Message: "already in a room"})
		return
	}

	h.mu.RLock()
	room, exists := h.rooms[code]
	h.mu.RUnlock()

	if !exists {
		c.sendMsg(ServerMessage{Type: MsgError, Message: "room not found"})
		return
	}

	room.mu.Lock()
	defer room.mu.Unlock()

	if room.players[1] != nil {
		c.sendMsg(ServerMessage{Type: MsgError, Message: "room is full"})
		return
	}

	room.players[1] = c
	c.room = room
	c.mark = "O"

	board := roomBoardToMsg(room.board)

	// Notify both players
	for _, p := range room.players {
		if p != nil {
			p.sendMsg(ServerMessage{
				Type:  MsgGameStart,
				Board: board,
				Turn:  room.turn,
			})
		}
	}
}

func (h *Hub) handleMove(c *Client, cellIndex int) {
	if c.room == nil {
		c.sendMsg(ServerMessage{Type: MsgError, Message: "not in a room"})
		return
	}

	room := c.room
	room.mu.Lock()
	defer room.mu.Unlock()

	if room.gameOver {
		c.sendMsg(ServerMessage{Type: MsgError, Message: "game is over"})
		return
	}

	if room.turn != c.mark {
		c.sendMsg(ServerMessage{Type: MsgError, Message: "not your turn"})
		return
	}

	if cellIndex < 0 || cellIndex > 8 {
		c.sendMsg(ServerMessage{Type: MsgError, Message: "invalid cell"})
		return
	}

	if room.board[cellIndex] != "" {
		c.sendMsg(ServerMessage{Type: MsgError, Message: "cell occupied"})
		return
	}

	room.board[cellIndex] = c.mark
	room.moveCount++

	// Check for win
	winner, winLine := checkWin(room.board)
	isDraw := winner == "" && room.moveCount >= 9

	if winner != "" || isDraw {
		room.gameOver = true
		board := roomBoardToMsg(room.board)

		result := "draw"
		if winner != "" {
			result = "win"
		}

		msg := ServerMessage{
			Type:     MsgGameOver,
			Board:    board,
			LastMove: cellIndex,
			Result:   result,
			Winner:   winner,
			WinLine:  winLine,
		}

		for _, p := range room.players {
			if p != nil {
				p.sendMsg(msg)
			}
		}

		// Record score
		h.recordOnlineScore(room, winner)
	} else {
		// Toggle turn
		if room.turn == "X" {
			room.turn = "O"
		} else {
			room.turn = "X"
		}

		board := roomBoardToMsg(room.board)
		msg := ServerMessage{
			Type:     MsgMoveMade,
			Board:    board,
			Turn:     room.turn,
			LastMove: cellIndex,
		}
		for _, p := range room.players {
			if p != nil {
				p.sendMsg(msg)
			}
		}
	}
}

func (h *Hub) handleRematch(c *Client) {
	if c.room == nil {
		c.sendMsg(ServerMessage{Type: MsgError, Message: "not in a room"})
		return
	}

	room := c.room
	room.mu.Lock()
	defer room.mu.Unlock()

	// Reset game state
	room.board = [9]string{}
	room.turn = "X"
	room.moveCount = 0
	room.gameOver = false

	board := roomBoardToMsg(room.board)
	for _, p := range room.players {
		if p != nil {
			p.sendMsg(ServerMessage{
				Type:  MsgGameStart,
				Board: board,
				Turn:  room.turn,
			})
		}
	}
}

func (h *Hub) handleDisconnect(c *Client) {
	if c.room == nil {
		return
	}

	room := c.room
	room.mu.Lock()

	// Notify opponent
	for i, p := range room.players {
		if p == c {
			room.players[i] = nil
		} else if p != nil {
			p.sendMsg(ServerMessage{Type: MsgOpponentLeft})
		}
	}

	// Remove room if empty
	empty := room.players[0] == nil && room.players[1] == nil
	room.mu.Unlock()

	if empty {
		h.mu.Lock()
		delete(h.rooms, room.code)
		h.mu.Unlock()
	}

	c.room = nil
}

func (h *Hub) cleanupStaleRooms() {
	h.mu.Lock()
	defer h.mu.Unlock()

	now := time.Now()
	for code, room := range h.rooms {
		if now.Sub(room.createdAt) > roomTimeout {
			room.mu.Lock()
			for _, p := range room.players {
				if p != nil {
					p.sendMsg(ServerMessage{Type: MsgError, Message: "room expired"})
					close(p.send)
				}
			}
			room.mu.Unlock()
			delete(h.rooms, code)
		}
	}
}

func (h *Hub) recordOnlineScore(room *Room, winner string) {
	if h.store == nil {
		return
	}

	for _, p := range room.players {
		if p == nil {
			continue
		}
		result := "draw"
		if winner == p.mark {
			result = "win"
		} else if winner != "" {
			result = "loss"
		}
		h.store.AddScore(models.CreateScoreRequest{
			Result:    result,
			Opponent:  "online",
			MoveCount: room.moveCount,
		})
	}
}

func (h *Hub) generateCode() string {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for {
		code := make([]byte, roomCodeLength)
		for i := range code {
			code[i] = codeChars[rand.Intn(len(codeChars))]
		}
		s := string(code)
		if _, exists := h.rooms[s]; !exists {
			return s
		}
	}
}

// Win detection (server-authoritative)
var winLines = [][3]int{
	{0, 1, 2}, {3, 4, 5}, {6, 7, 8}, // rows
	{0, 3, 6}, {1, 4, 7}, {2, 5, 8}, // cols
	{0, 4, 8}, {2, 4, 6}, // diagonals
}

func checkWin(board [9]string) (string, []int) {
	for _, line := range winLines {
		a, b, c := board[line[0]], board[line[1]], board[line[2]]
		if a != "" && a == b && b == c {
			return a, []int{line[0], line[1], line[2]}
		}
	}
	return "", nil
}

func roomBoardToMsg(board [9]string) [9]*string {
	var out [9]*string
	for i, v := range board {
		if v != "" {
			s := v
			out[i] = &s
		}
	}
	return out
}
