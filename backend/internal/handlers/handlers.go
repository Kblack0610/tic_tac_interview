package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/kblack0610/cheddr-tictactoe-api/internal/models"
	"github.com/kblack0610/cheddr-tictactoe-api/internal/store"
)

type Handlers struct {
	store *store.Store
}

func New(s *store.Store) *Handlers {
	return &Handlers{store: s}
}

func (h *Handlers) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *Handlers) ListScores(w http.ResponseWriter, r *http.Request) {
	limit := 50
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	scores, err := h.store.GetScores(limit)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to fetch scores"})
		return
	}
	if scores == nil {
		scores = []models.Score{}
	}
	writeJSON(w, http.StatusOK, scores)
}

func (h *Handlers) CreateScore(w http.ResponseWriter, r *http.Request) {
	var req models.CreateScoreRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
		return
	}

	if req.Result == "" || req.Opponent == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "result and opponent are required"})
		return
	}

	score, err := h.store.AddScore(req)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save score"})
		return
	}

	writeJSON(w, http.StatusCreated, score)
}

func (h *Handlers) Leaderboard(w http.ResponseWriter, r *http.Request) {
	entries, err := h.store.GetLeaderboard()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to fetch leaderboard"})
		return
	}
	if entries == nil {
		entries = []models.LeaderboardEntry{}
	}
	writeJSON(w, http.StatusOK, entries)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}
