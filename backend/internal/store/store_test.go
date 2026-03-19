package store

import (
	"testing"

	"github.com/kblack0610/cheddr-tictactoe-api/internal/models"
)

func newTestStore(t *testing.T) *Store {
	t.Helper()
	s, err := New(":memory:")
	if err != nil {
		t.Fatalf("new store: %v", err)
	}
	t.Cleanup(func() { s.Close() })
	return s
}

func TestAddAndGetScores(t *testing.T) {
	s := newTestStore(t)

	req := models.CreateScoreRequest{
		Result:     "win",
		Difficulty: "easy",
		Opponent:   "lucky",
		MoveCount:  5,
		DurationMs: 12000,
	}
	score, err := s.AddScore(req)
	if err != nil {
		t.Fatalf("add score: %v", err)
	}
	if score.ID == 0 {
		t.Error("expected non-zero ID")
	}
	if score.Result != "win" {
		t.Errorf("result = %q, want %q", score.Result, "win")
	}
	if score.Opponent != "lucky" {
		t.Errorf("opponent = %q, want %q", score.Opponent, "lucky")
	}

	scores, err := s.GetScores(10)
	if err != nil {
		t.Fatalf("get scores: %v", err)
	}
	if len(scores) != 1 {
		t.Fatalf("len(scores) = %d, want 1", len(scores))
	}
	if scores[0].MoveCount != 5 {
		t.Errorf("move_count = %d, want 5", scores[0].MoveCount)
	}
}

func TestGetScoresLimit(t *testing.T) {
	s := newTestStore(t)

	for i := 0; i < 5; i++ {
		_, err := s.AddScore(models.CreateScoreRequest{
			Result: "win", Opponent: "lucky",
		})
		if err != nil {
			t.Fatalf("add score %d: %v", i, err)
		}
	}

	scores, err := s.GetScores(3)
	if err != nil {
		t.Fatalf("get scores: %v", err)
	}
	if len(scores) != 3 {
		t.Errorf("len(scores) = %d, want 3", len(scores))
	}
}

func TestGetLeaderboard(t *testing.T) {
	s := newTestStore(t)

	games := []models.CreateScoreRequest{
		{Result: "win", Opponent: "lucky"},
		{Result: "win", Opponent: "lucky"},
		{Result: "loss", Opponent: "lucky"},
		{Result: "draw", Opponent: "sharp"},
		{Result: "win", Opponent: "sharp"},
	}
	for _, g := range games {
		if _, err := s.AddScore(g); err != nil {
			t.Fatalf("add score: %v", err)
		}
	}

	entries, err := s.GetLeaderboard()
	if err != nil {
		t.Fatalf("get leaderboard: %v", err)
	}
	if len(entries) != 2 {
		t.Fatalf("len(entries) = %d, want 2", len(entries))
	}

	// Lucky has 3 games, Sharp has 2
	if entries[0].Opponent != "lucky" {
		t.Errorf("first entry opponent = %q, want %q", entries[0].Opponent, "lucky")
	}
	if entries[0].TotalGames != 3 {
		t.Errorf("lucky total = %d, want 3", entries[0].TotalGames)
	}
	if entries[0].Wins != 2 {
		t.Errorf("lucky wins = %d, want 2", entries[0].Wins)
	}
	if entries[0].Losses != 1 {
		t.Errorf("lucky losses = %d, want 1", entries[0].Losses)
	}
}

func TestEmptyScores(t *testing.T) {
	s := newTestStore(t)

	scores, err := s.GetScores(10)
	if err != nil {
		t.Fatalf("get scores: %v", err)
	}
	if scores != nil {
		t.Errorf("expected nil, got %v", scores)
	}

	entries, err := s.GetLeaderboard()
	if err != nil {
		t.Fatalf("get leaderboard: %v", err)
	}
	if entries != nil {
		t.Errorf("expected nil, got %v", entries)
	}
}
