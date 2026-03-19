# Cheddr Tic-Tac-Toe

A polished single-player tic-tac-toe game built with Expo React Native. Three AI opponents with distinct personalities — from lucky beginner to unbeatable house.

## Quick Start

```bash
# Prerequisites: Node 18+
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android), or press `w` for web.

## AI Opponents

| Opponent | Difficulty | Strategy |
|----------|-----------|----------|
| Lucky 🍀 | Easy | 30% optimal, 70% random — friendly and beatable |
| Sharp 🎯 | Medium | 75% optimal — calculated, occasionally slips |
| The House 🏛️ | Hard | 100% minimax with alpha-beta pruning — unbeatable |

## Architecture

```
app/                      # Expo Router screens
  _layout.tsx             # Root layout, fonts, splash
  index.tsx               # Home screen
  difficulty.tsx          # AI opponent picker
  game.tsx                # Game board
  settings.tsx            # Preferences & stats

src/
  engine/                 # Pure game logic — ZERO React imports
    types.ts              # Board, Player, GameResult (discriminated unions)
    board.ts              # Win detection, move validation
    minimax.ts            # Alpha-beta pruning AI
    ai-personalities.ts   # Lucky, Sharp, The House
    ai.ts                 # Difficulty-scaled move selection
  store/                  # Zustand state management
    game-store.ts         # Board state, turns
    settings-store.ts     # Sound/haptics prefs (persisted)
    stats-store.ts        # Win/loss/draw record (persisted)
  components/             # Animated UI components
    Board/                # Grid, cells, SVG marks, win line
    GameHeader.tsx        # Turn indicator, score bar
    AIAvatar.tsx          # Opponent display with thinking animation
    Button.tsx            # Haptic-feedback button
    CelebrationOverlay.tsx # Confetti on win
  hooks/                  # Game loop, haptics, sound
  theme/                  # Design tokens (colors, typography, spacing)
```

### Key Design Decisions

- **Engine/UI separation**: `src/engine/` has zero React imports. Every function is pure `(Board, Player) → Move`. Portable to any runtime.
- **Discriminated unions**: `GameResult = { status: 'win'; winner; line } | { status: 'draw' } | { status: 'playing' }` — no string comparisons.
- **Minimax with alpha-beta pruning**: Mathematically provable optimal play. The House never loses.
- **Animated SVG marks**: X draws as two crossing strokes, O draws as a clockwise circle — all 60fps via Reanimated.

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

42 tests covering all engine functions — win detection on all 8 lines, AI optimality (200 random games), immutability, edge cases.

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Expo SDK 55 | Zero native config, QR code → play |
| Navigation | Expo Router | File-based, modern |
| Animations | Reanimated 4 + SVG | 60fps animated marks |
| Haptics | expo-haptics | Tactile feedback |
| State | Zustand + persist | Lightweight, survives restart |
| Theme | Custom dark palette | Wagering-inspired (gold accents) |
| Font | Space Grotesk | Geometric, modern |
| Testing | Vitest | Fast, pure engine tests |

## License

MIT
