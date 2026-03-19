import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'SpaceGrotesk',
  android: 'SpaceGrotesk',
  web: 'SpaceGrotesk, system-ui, -apple-system, sans-serif',
  default: 'SpaceGrotesk',
});

export const typography = {
  fontFamily,

  // Font weights — Space Grotesk supports 300-700
  weight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Type scale
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },

  lineHeight: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;
