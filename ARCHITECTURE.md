# Architecture Deep Dive

## Design Philosophy

This project demonstrates how I approach building mobile applications at scale: **separation of concerns, testable pure logic, and premium visual polish**.

The game engine contains zero framework dependencies — every function is a pure transformation from state to state. This pattern scales to production: the same engine could run on a Go backend for server-authoritative multiplayer, in a Web Worker for non-blocking AI computation, or in a test suite without any DOM or React Native runtime.

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
| `game-store` | No | Current board, turns, AI state |
| `settings-store` | Yes | Sound, haptics preferences |
| `stats-store` | Yes | Lifetime win/loss/draw by difficulty |

Zustand was chosen over Context + useReducer for:
- No provider nesting / re-render cascading
- Built-in persist middleware with AsyncStorage
- Selectors for granular subscriptions

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

## Future Roadmap

### WebSocket Multiplayer
Room-based real-time play via a lightweight Express + ws server (~150 lines). Player 1 creates a room, gets a 4-character code, Player 2 joins. The same game engine validates moves on both client and server, preventing desync.

### Behavior Tree AI
Replace probability-weighted random with personality-driven decision trees:
- **Aggressive**: Always takes center/corners, forks when possible
- **Defensive**: Prioritizes blocking, plays for draws
- **Chaotic**: Random but with "aha moments" where it suddenly plays optimally
- **Mentor**: Deliberately leaves openings for the player to find, comments on good/bad moves

### Server-Authoritative Game State
Move the source of truth to the Go backend — clients send move intents, server validates and broadcasts. This prevents cheating and enables features like move history, replays, and ELO ratings.

### Infrastructure
- Docker multi-stage builds (Go binary + static Expo web export)
- Kubernetes manifests for horizontal scaling
- GitHub Actions CI/CD with test gates
