package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/rs/cors"

	"github.com/kblack0610/cheddr-tictactoe-api/internal/handlers"
	"github.com/kblack0610/cheddr-tictactoe-api/internal/store"
	"github.com/kblack0610/cheddr-tictactoe-api/internal/ws"
)

func main() {
	port := envOr("PORT", "8080")
	dbPath := envOr("DB_PATH", "./data/cheddr.db")

	// Ensure data directory exists
	if err := os.MkdirAll("./data", 0755); err != nil {
		log.Fatalf("create data dir: %v", err)
	}

	// Initialize store
	s, err := store.New(dbPath)
	if err != nil {
		log.Fatalf("init store: %v", err)
	}
	defer s.Close()

	// Initialize WebSocket hub
	hub := ws.NewHub(s)
	go hub.Run()

	h := handlers.New(s)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: false,
	}).Handler)

	r.Route("/api", func(r chi.Router) {
		// REST endpoints get a timeout
		r.Group(func(r chi.Router) {
			r.Use(middleware.Timeout(30 * time.Second))
			r.Get("/health", h.Health)
			r.Get("/scores", h.ListScores)
			r.Post("/scores", h.CreateScore)
			r.Get("/scores/leaderboard", h.Leaderboard)
		})

		// WebSocket: no timeout (long-lived connections)
		r.Get("/ws", hub.HandleWS)
	})

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	// Graceful shutdown
	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
		<-sigCh

		log.Println("shutting down...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		srv.Shutdown(ctx)
	}()

	log.Printf("listening on :%s", port)
	if err := srv.ListenAndServe(); err != http.ErrServerClosed {
		log.Fatalf("server error: %v", err)
	}
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
