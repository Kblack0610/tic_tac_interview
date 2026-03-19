package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kblack0610/cheddr-tictactoe-api/internal/models"
	"github.com/kblack0610/cheddr-tictactoe-api/internal/store"
)

func newTestHandlers(t *testing.T) *Handlers {
	t.Helper()
	s, err := store.New(":memory:")
	if err != nil {
		t.Fatalf("new store: %v", err)
	}
	t.Cleanup(func() { s.Close() })
	return New(s)
}

func TestHealth(t *testing.T) {
	h := newTestHandlers(t)

	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	w := httptest.NewRecorder()
	h.Health(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var body map[string]string
	json.NewDecoder(w.Body).Decode(&body)
	if body["status"] != "ok" {
		t.Errorf("status = %q, want %q", body["status"], "ok")
	}
}

func TestCreateScore(t *testing.T) {
	h := newTestHandlers(t)

	payload := models.CreateScoreRequest{
		Result:     "win",
		Difficulty: "easy",
		Opponent:   "lucky",
		MoveCount:  5,
		DurationMs: 8000,
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/api/scores", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	h.CreateScore(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("status = %d, want %d", w.Code, http.StatusCreated)
	}

	var score models.Score
	json.NewDecoder(w.Body).Decode(&score)
	if score.Result != "win" {
		t.Errorf("result = %q, want %q", score.Result, "win")
	}
	if score.Opponent != "lucky" {
		t.Errorf("opponent = %q, want %q", score.Opponent, "lucky")
	}
}

func TestCreateScoreValidation(t *testing.T) {
	h := newTestHandlers(t)

	payload := models.CreateScoreRequest{Result: "", Opponent: ""}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/api/scores", bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.CreateScore(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestListScoresEmpty(t *testing.T) {
	h := newTestHandlers(t)

	req := httptest.NewRequest(http.MethodGet, "/api/scores", nil)
	w := httptest.NewRecorder()
	h.ListScores(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var scores []models.Score
	json.NewDecoder(w.Body).Decode(&scores)
	if len(scores) != 0 {
		t.Errorf("len(scores) = %d, want 0", len(scores))
	}
}

func TestLeaderboard(t *testing.T) {
	h := newTestHandlers(t)

	games := []models.CreateScoreRequest{
		{Result: "win", Opponent: "lucky"},
		{Result: "loss", Opponent: "lucky"},
		{Result: "win", Opponent: "sharp"},
	}
	for _, g := range games {
		body, _ := json.Marshal(g)
		req := httptest.NewRequest(http.MethodPost, "/api/scores", bytes.NewReader(body))
		w := httptest.NewRecorder()
		h.CreateScore(w, req)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/scores/leaderboard", nil)
	w := httptest.NewRecorder()
	h.Leaderboard(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var entries []models.LeaderboardEntry
	json.NewDecoder(w.Body).Decode(&entries)
	if len(entries) != 2 {
		t.Fatalf("len(entries) = %d, want 2", len(entries))
	}
}
