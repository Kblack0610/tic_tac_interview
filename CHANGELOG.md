# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.5-experimental] - 2026-03-19

### Added
- WebSocket-based online multiplayer with room codes
- Lobby screen for creating/joining games
- `OnlineGameHeader` component with room code display and connection status
- `useOnlineGame` hook for WebSocket game lifecycle
- `src/services/websocket.ts` client with auto-reconnect
- Kubernetes deployment manifests (`k8s/`)
- Backend CI/CD pipeline (`.github/workflows/backend.yml`) — test, build, push to GHCR
- GitHub Actions workflow for Android APK builds on tag push

### Changed
- Game store now supports three modes: `ai`, `local`, `online`
- `playMove` branches by mode with `onlineMoveCallback` for WS moves
- Backend upgraded from REST-only to REST + WebSocket on same server

## [2.0.0] - 2026-03-18

### Added
- Go backend with chi router and SQLite (pure-Go `modernc.org/sqlite`)
- REST API: `GET /api/health`, `GET /api/scores`, `POST /api/scores`, `GET /api/scores/leaderboard`
- Fire-and-forget score sync from client (`src/services/api.ts`)
- `src/constants.ts` API_BASE_URL with dev/prod switching
- Backend Dockerfile (multi-stage, scratch-based)
- Backend Makefile for local dev

## [1.5.0] - 2026-03-17

### Added
- Local 2-player multiplayer mode
- `GameMode` type (`ai | local | online`) in engine types
- `LocalGameHeader` component for player-vs-player UI
- `useLocalGameLoop` hook for pass-and-play turns
- Mode selection on home screen
- Per-mode stats tracking in stats store

## [1.0.0] - 2026-03-16

### Added
- Three AI opponents: Lucky (easy), Sharp (medium), The House (hard/unbeatable)
- Minimax engine with alpha-beta pruning
- Animated SVG marks (X strokes, O circle draw) via Reanimated 4
- Confetti celebration overlay on win
- Haptic feedback and sound effects
- Dark "Arena" theme with gold accents (Space Grotesk font)
- Zustand state management with AsyncStorage persistence
- 42 engine tests (win detection, AI optimality, immutability)
- Expo Router file-based navigation
