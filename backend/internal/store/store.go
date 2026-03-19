package store

import (
	"database/sql"
	"fmt"

	"github.com/kblack0610/cheddr-tictactoe-api/internal/models"
	_ "modernc.org/sqlite"
)

type Store struct {
	db *sql.DB
}

func New(dsn string) (*Store, error) {
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}

	// Enable WAL mode for better concurrent read performance
	if _, err := db.Exec("PRAGMA journal_mode=WAL"); err != nil {
		return nil, fmt.Errorf("set WAL mode: %w", err)
	}

	s := &Store{db: db}
	if err := s.migrate(); err != nil {
		return nil, fmt.Errorf("migrate: %w", err)
	}
	return s, nil
}

func (s *Store) Close() error {
	return s.db.Close()
}

func (s *Store) migrate() error {
	_, err := s.db.Exec(`
		CREATE TABLE IF NOT EXISTS scores (
			id          INTEGER PRIMARY KEY AUTOINCREMENT,
			result      TEXT NOT NULL,
			difficulty  TEXT NOT NULL DEFAULT '',
			opponent    TEXT NOT NULL,
			move_count  INTEGER NOT NULL DEFAULT 0,
			duration_ms INTEGER NOT NULL DEFAULT 0,
			created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`)
	return err
}

func (s *Store) AddScore(req models.CreateScoreRequest) (models.Score, error) {
	res, err := s.db.Exec(
		`INSERT INTO scores (result, difficulty, opponent, move_count, duration_ms) VALUES (?, ?, ?, ?, ?)`,
		req.Result, req.Difficulty, req.Opponent, req.MoveCount, req.DurationMs,
	)
	if err != nil {
		return models.Score{}, fmt.Errorf("insert score: %w", err)
	}

	id, _ := res.LastInsertId()
	return s.getByID(id)
}

func (s *Store) getByID(id int64) (models.Score, error) {
	var sc models.Score
	err := s.db.QueryRow(
		`SELECT id, result, difficulty, opponent, move_count, duration_ms, created_at FROM scores WHERE id = ?`, id,
	).Scan(&sc.ID, &sc.Result, &sc.Difficulty, &sc.Opponent, &sc.MoveCount, &sc.DurationMs, &sc.CreatedAt)
	if err != nil {
		return models.Score{}, fmt.Errorf("get score by id: %w", err)
	}
	return sc, nil
}

func (s *Store) GetScores(limit int) ([]models.Score, error) {
	if limit <= 0 {
		limit = 50
	}
	rows, err := s.db.Query(
		`SELECT id, result, difficulty, opponent, move_count, duration_ms, created_at FROM scores ORDER BY created_at DESC LIMIT ?`, limit,
	)
	if err != nil {
		return nil, fmt.Errorf("query scores: %w", err)
	}
	defer rows.Close()

	var scores []models.Score
	for rows.Next() {
		var sc models.Score
		if err := rows.Scan(&sc.ID, &sc.Result, &sc.Difficulty, &sc.Opponent, &sc.MoveCount, &sc.DurationMs, &sc.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan score: %w", err)
		}
		scores = append(scores, sc)
	}
	return scores, rows.Err()
}

func (s *Store) GetLeaderboard() ([]models.LeaderboardEntry, error) {
	rows, err := s.db.Query(`
		SELECT
			opponent,
			COUNT(*) as total_games,
			SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
			SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END) as losses,
			SUM(CASE WHEN result = 'draw' THEN 1 ELSE 0 END) as draws
		FROM scores
		GROUP BY opponent
		ORDER BY total_games DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("query leaderboard: %w", err)
	}
	defer rows.Close()

	var entries []models.LeaderboardEntry
	for rows.Next() {
		var e models.LeaderboardEntry
		if err := rows.Scan(&e.Opponent, &e.TotalGames, &e.Wins, &e.Losses, &e.Draws); err != nil {
			return nil, fmt.Errorf("scan leaderboard: %w", err)
		}
		if e.TotalGames > 0 {
			e.WinRate = float64(e.Wins) / float64(e.TotalGames)
		}
		entries = append(entries, e)
	}
	return entries, rows.Err()
}
