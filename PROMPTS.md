# AI Prompt History

This document records the AI-assisted development process for this project, as requested by the evaluation criteria.

## Development Approach

This project was built using Claude (Anthropic) as a pair programming partner. The development process followed a plan-first approach:

1. **Architecture planning** — Defined the full project structure, tech stack decisions, and implementation phases before writing code
2. **Engine-first development** — Built and tested the pure game logic before any UI work
3. **Component composition** — Built reusable, animated components that compose into screens
4. **Iterative polish** — Visual refinements, haptic/sound integration, edge case handling

## Key Prompts & Decisions

### Initial Planning
- Requested a comprehensive implementation plan for a principal-level React Native tic-tac-toe submission
- Evaluated two approaches: standalone Expo app vs. monorepo with Go backend
- Chose standalone for reviewer ease-of-use (`npm install && npx expo start`)

### Engine Design
- Specified pure functional approach: all game logic as `(Board, Player) → Move` with zero React imports
- Requested minimax with alpha-beta pruning, with difficulty scaling via probability weighting (not depth-limiting)
- Defined AI personalities with taunt messages and thinking delays

### Visual Design
- Requested "Arena Dark" theme inspired by sports wagering UIs
- Specified animated SVG marks (stroke-draw for X, clockwise circle for O)
- Confetti celebration overlay on win

### Architecture Decisions Made by AI
- **Discriminated unions** for `GameResult` instead of separate boolean flags
- **Three isolated Zustand stores** instead of a single monolithic store
- **Probability-weighted difficulty** instead of depth-limited minimax
- **Expo Router** file-based routing instead of React Navigation

## What Was Human-Directed vs AI-Generated

| Aspect | Human | AI |
|--------|-------|----|
| Tech stack choice | ✓ | |
| Visual theme concept | ✓ | |
| AI difficulty approach | ✓ | |
| Code architecture | ✓ | ✓ |
| Implementation | | ✓ |
| Testing strategy | ✓ | ✓ |
| Documentation | ✓ | ✓ |
