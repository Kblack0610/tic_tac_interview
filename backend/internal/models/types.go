package models

import "time"

type Score struct {
	ID         int64     `json:"id"`
	Result     string    `json:"result"`     // "win", "loss", "draw"
	Difficulty string    `json:"difficulty"`  // "easy", "medium", "hard", ""
	Opponent   string    `json:"opponent"`    // AI personality ID, "local", or "online"
	MoveCount  int       `json:"move_count"`
	DurationMs int64     `json:"duration_ms"`
	CreatedAt  time.Time `json:"created_at"`
}

type CreateScoreRequest struct {
	Result     string `json:"result"`
	Difficulty string `json:"difficulty"`
	Opponent   string `json:"opponent"`
	MoveCount  int    `json:"move_count"`
	DurationMs int64  `json:"duration_ms"`
}

type LeaderboardEntry struct {
	Opponent   string `json:"opponent"`
	TotalGames int    `json:"total_games"`
	Wins       int    `json:"wins"`
	Losses     int    `json:"losses"`
	Draws      int    `json:"draws"`
	WinRate    float64 `json:"win_rate"`
}
