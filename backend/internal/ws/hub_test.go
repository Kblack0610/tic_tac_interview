package ws

import "testing"

func TestCheckWin(t *testing.T) {
	tests := []struct {
		name    string
		board   [9]string
		winner  string
		hasLine bool
	}{
		{
			name:    "X wins top row",
			board:   [9]string{"X", "X", "X", "", "", "", "", "", ""},
			winner:  "X",
			hasLine: true,
		},
		{
			name:    "O wins diagonal",
			board:   [9]string{"O", "", "", "", "O", "", "", "", "O"},
			winner:  "O",
			hasLine: true,
		},
		{
			name:    "no winner",
			board:   [9]string{"X", "O", "X", "X", "O", "", "", "X", "O"},
			winner:  "",
			hasLine: false,
		},
		{
			name:    "empty board",
			board:   [9]string{},
			winner:  "",
			hasLine: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			winner, line := checkWin(tt.board)
			if winner != tt.winner {
				t.Errorf("winner = %q, want %q", winner, tt.winner)
			}
			if tt.hasLine && line == nil {
				t.Error("expected win line, got nil")
			}
			if !tt.hasLine && line != nil {
				t.Errorf("expected no win line, got %v", line)
			}
		})
	}
}

func TestRoomBoardToMsg(t *testing.T) {
	board := [9]string{"X", "", "O", "", "", "", "", "", ""}
	msg := roomBoardToMsg(board)

	if msg[0] == nil || *msg[0] != "X" {
		t.Errorf("msg[0] = %v, want X", msg[0])
	}
	if msg[1] != nil {
		t.Errorf("msg[1] = %v, want nil", msg[1])
	}
	if msg[2] == nil || *msg[2] != "O" {
		t.Errorf("msg[2] = %v, want O", msg[2])
	}
}

func TestGenerateCode(t *testing.T) {
	hub := &Hub{rooms: make(map[string]*Room)}
	code := hub.generateCode()

	if len(code) != roomCodeLength {
		t.Errorf("code length = %d, want %d", len(code), roomCodeLength)
	}

	// Ensure uniqueness over many generations
	codes := make(map[string]bool)
	for i := 0; i < 100; i++ {
		c := hub.generateCode()
		if codes[c] {
			t.Errorf("duplicate code generated: %s", c)
		}
		codes[c] = true
	}
}
