# Architecture Deep Dive

## Design Philosophy

This project demonstrates how I approach building mobile applications at scale: **separation of concerns, testable pure logic, and premium visual polish**.

The game engine contains zero framework dependencies — every function is a pure transformation from state to state. This same engine runs on the client for AI and local modes, and its logic is mirrored on the Go backend for server-authoritative online multiplayer. The engine can also run in a Web Worker for non-blocking AI computation, or in a test suite without any DOM or React Native runtime.

## Engine Architecture

```
Board (9-tuple) + Player → Move (CellIndex)
```

The entire game is a state machine:

```typescript
type GameResult =
  | { status: 'playing' }
  | { status: 'win'; winner: Player; line: WinLine }
  | { status: 'draw' };
```

No booleans, no string comparisons. TypeScript's discriminated unions mean the compiler verifies exhaustive handling at every branch.

### AI Implementation

**Minimax with alpha-beta pruning** — the canonical game tree search algorithm:

1. Score terminal states: win = +10 (minus depth for faster wins), loss = -10 (plus depth), draw = 0
2. Alpha-beta pruning cuts branches that can't improve the result, reducing 9! to ~hundreds of evaluations
3. Difficulty scaling via `optimalRate` — probability of choosing the minimax-optimal move vs. random

This approach is deliberately simple and provably correct. For a 3x3 board, minimax is O(1) after pruning (the game tree is finite and small). Over-engineering with neural networks or Monte Carlo tree search would be resume-driven development.

### Why Not Depth-Limited Minimax for Difficulty?

Many implementations use `minimax(depth=2)` for "easy". This produces **weird** AI that plays optimally for 2 moves then randomly — it doesn't feel like a weaker player, it feels broken.

Instead, I use probability-weighted move selection: easy AI plays randomly 70% of the time. This produces natural-feeling gameplay where the AI makes human-like mistakes (playing suboptimal positions) rather than algorithmic artifacts.

## State Management

Three isolated Zustand stores, each with single responsibility:

| Store | Persisted | Purpose |
|-------|-----------|---------|
| `game-store` | No | Current board, turns, mode (`ai`/`local`/`online`), online state |
| `settings-store` | Yes | Sound, haptics preferences |
| `stats-store` | Yes | Lifetime win/loss/draw by difficulty and mode |

Zustand was chosen over Context + useReducer for:
- No provider nesting / re-render cascading
- Built-in persist middleware with AsyncStorage
- Selectors for granular subscriptions

## Multiplayer Architecture

### Three Game Modes

The app supports three modes via the `GameMode` type (`ai | local | online`), each with a dedicated hook:

| Mode | Hook | Store Interaction |
|------|------|-------------------|
| AI | `useGameLoop` | `playMove('ai')` — engine computes AI response |
| Local 2P | `useLocalGameLoop` | `playMove('local')` — alternates X/O on same device |
| Online | `useOnlineGame` | `playMove('online')` — sends move via `onlineMoveCallback` |

### Hook-Per-Mode Pattern

Each hook encapsulates its mode's lifecycle:
- **`useGameLoop`**: Triggers AI move after human plays, with configurable delay for "thinking" feel
- **`useLocalGameLoop`**: Pure turn alternation, no AI computation
- **`useOnlineGame`**: Manages WebSocket connection, room state, opponent moves, and disconnect handling

### Store Mode Branching

The game store's `playMove` action branches by mode:
- `ai`/`local`: Apply move directly to board, check result
- `online`: Apply move locally for instant feedback, then invoke `onlineMoveCallback` to send via WebSocket. Server broadcasts to opponent, who applies via `move_made` handler.

## Backend Architecture

### Router Design

Chi router with grouped middleware — REST endpoints get a 30-second timeout, while the WebSocket endpoint (`/api/ws`) runs without timeout for long-lived connections.

```
/api
  GET  /health              # Liveness probe
  GET  /scores              # List scores (with timeout)
  POST /scores              # Submit score (with timeout)
  GET  /scores/leaderboard  # Aggregated stats (with timeout)
  GET  /ws                  # WebSocket (no timeout)
```

### SQLite Layer

Uses `modernc.org/sqlite` — a pure-Go SQLite implementation (no CGO). This means:
- Single static binary, no shared library dependencies
- Scratch-based Docker image (< 15MB)
- WAL mode for concurrent reads during writes

### WebSocket Hub Pattern

The real-time multiplayer uses a hub-and-spoke architecture:

- **Hub goroutine**: Central dispatcher — receives messages from clients, manages rooms, broadcasts state
- **Client**: Two goroutines per connection — `readPump` (client → hub) and `writePump` (hub → client)
- **Room**: Game state container with two client slots, board state, and turn tracking

Room lifecycle:
1. `create_room` → Hub creates room with 4-char code, adds creator as Player X
2. `join_room` → Hub finds room by code, adds joiner as Player O, sends `game_start` to both
3. `move` → Hub validates (correct turn, valid cell), applies move, broadcasts `move_made` or `game_over`
4. Disconnect → Hub sends `opponent_left`, cleans up room after both leave

## Animation System

All animations use React Native Reanimated, running on the UI thread for guaranteed 60fps:

- **X mark**: Two `<Line>` elements animate their endpoints from center outward, staggered by 100ms
- **O mark**: `<Circle>` with `strokeDasharray` + animated `strokeDashoffset` draws clockwise
- **Win line**: Golden `<Line>` animates from first winning cell to last
- **Confetti**: 24 particles with randomized fall trajectories, rotation, and fade

## Visual Design: "Arena Dark"

The color palette draws from sports wagering UIs (DraftKings, FanDuel) — dark backgrounds with gold accents that evoke premium, high-stakes aesthetics:

- **Background**: Near-black with blue undertone (#0A0E17)
- **Gold accent** (#F5B83D): CTAs, win celebrations, brand moments
- **Player X**: Cool blue (#60A5FA) — calm, analytical
- **Player O**: Warm pink (#F472B6) — energetic, aggressive
- **Win/Loss**: Emerald (#34D399) / Ruby (#F87171) — universal

## Infrastructure

### Kubernetes Strategy

Single-replica deployment with:
- Resource limits (64Mi–256Mi memory, 50m–200m CPU)
- Liveness/readiness probes on `/api/health`
- PersistentVolumeClaim for SQLite data directory
- Traefik ingress with cert-manager for automatic Let's Encrypt TLS

### CI/CD Pipeline

```
Push to master (backend/**) → Go test → Docker build (arm64) → Push to GHCR
Tag push (v*) → Node setup → Expo prebuild → Gradle assembleDebug → GitHub Release with APK
```

## Future Roadmap

### Behavior Tree AI
Replace probability-weighted random with personality-driven decision trees:
- **Aggressive**: Always takes center/corners, forks when possible
- **Defensive**: Prioritizes blocking, plays for draws
- **Chaotic**: Random but with "aha moments" where it suddenly plays optimally
- **Mentor**: Deliberately leaves openings for the player to find, comments on good/bad moves

### ELO Ratings
Track player skill across online matches with an ELO rating system. Matchmaking by skill bracket.

### Replays
Record move history server-side. Players can review past games move-by-move.

### Spectator Mode
Allow third parties to watch live games via read-only WebSocket connections.
