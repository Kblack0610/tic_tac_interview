/**
 * Arena Dark — sports wagering inspired palette.
 * Dark-first with gold accents evoking premium betting UX.
 */
export const colors = {
  // Backgrounds
  bg: {
    primary: '#0A0E17',
    secondary: '#111827',
    surface: '#1A2035',
    elevated: '#222B45',
  },

  // Player marks
  player: {
    x: '#60A5FA',      // Cool blue
    xGlow: '#3B82F6',
    o: '#F472B6',      // Warm pink
    oGlow: '#EC4899',
  },

  // Accent
  accent: {
    gold: '#F5B83D',
    goldDim: '#C4922F',
    purple: '#8B5CF6',
    purpleDim: '#7C3AED',
  },

  // Status
  status: {
    win: '#34D399',
    winGlow: '#10B981',
    lose: '#F87171',
    loseGlow: '#EF4444',
    draw: '#FBBF24',
  },

  // Grid
  grid: {
    line: '#2D3A56',
    lineGlow: '#3D4F73',
  },

  // Text
  text: {
    primary: '#F1F5F9',
    secondary: '#94A3B8',
    muted: '#64748B',
  },

  // Misc
  overlay: 'rgba(0, 0, 0, 0.7)',
  transparent: 'transparent',
} as const;
