import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

interface Particle {
  x: number;
  color: string;
  delay: number;
  size: number;
}

const PARTICLE_COUNT = 24;
const PARTICLE_COLORS = [
  colors.accent.gold,
  colors.player.x,
  colors.player.o,
  colors.status.win,
  '#FFFFFF',
];

interface CelebrationOverlayProps {
  visible: boolean;
  type: 'win' | 'lose' | 'draw';
}

export function CelebrationOverlay({ visible, type }: CelebrationOverlayProps) {
  const { width, height } = useWindowDimensions();
  const opacity = useSharedValue(0);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i): Particle => ({
        x: Math.random() * width,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        delay: Math.random() * 400,
        size: 4 + Math.random() * 8,
      })),
    [width],
  );

  useEffect(() => {
    if (visible && type === 'win') {
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible, type]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: visible && type === 'win' ? 'none' as const : 'none' as const,
  }));

  if (type !== 'win') return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {particles.map((particle, i) => (
        <ConfettiPiece key={i} particle={particle} height={height} />
      ))}
    </Animated.View>
  );
}

function ConfettiPiece({ particle, height }: { particle: Particle; height: number }) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const pieceOpacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      particle.delay,
      withTiming(height + 20, { duration: 1500 + Math.random() * 1000 }),
    );
    translateX.value = withDelay(
      particle.delay,
      withTiming((Math.random() - 0.5) * 100, { duration: 1500 }),
    );
    rotate.value = withDelay(
      particle.delay,
      withTiming(360 * (1 + Math.random() * 2), { duration: 1500 }),
    );
    pieceOpacity.value = withDelay(
      particle.delay + 1000,
      withTiming(0, { duration: 500 }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: pieceOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: particle.x,
          top: -20,
          width: particle.size,
          height: particle.size * 1.5,
          backgroundColor: particle.color,
          borderRadius: 2,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
});
