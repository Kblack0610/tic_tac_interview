import { Easing } from 'react-native-reanimated';

/** Shared animation configs for consistency */
export const animations = {
  // Spring configs
  spring: {
    snappy: { damping: 15, stiffness: 300, mass: 0.8 },
    bouncy: { damping: 10, stiffness: 200, mass: 1 },
    gentle: { damping: 20, stiffness: 150, mass: 1 },
    button: { damping: 12, stiffness: 400, mass: 0.6 },
  },

  // Timing durations (ms)
  duration: {
    instant: 100,
    fast: 200,
    markDraw: 300,
    normal: 400,
    gridDraw: 600,
    celebration: 1000,
  },

  // Easing curves
  easing: {
    smooth: Easing.bezier(0.4, 0, 0.2, 1),
    decelerate: Easing.bezier(0, 0, 0.2, 1),
    accelerate: Easing.bezier(0.4, 0, 1, 1),
  },

  // Stagger delays between sequential animations
  stagger: {
    gridLines: 100,
    cells: 50,
    cards: 80,
  },
} as const;
