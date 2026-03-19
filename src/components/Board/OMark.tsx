import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { animations } from '../../theme/animations';
import { MARK_PADDING_RATIO, MARK_STROKE_WIDTH } from '../../constants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface OMarkProps {
  size: number;
  animate?: boolean;
}

export function OMark({ size, animate = true }: OMarkProps) {
  const padding = size * MARK_PADDING_RATIO;
  const center = size / 2;
  const radius = (size - padding * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(animate ? 0 : 1);

  useEffect(() => {
    if (animate) {
      progress.value = withTiming(1, {
        duration: animations.duration.markDraw,
        easing: animations.easing.smooth,
      });
    }
  }, [animate]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <AnimatedCircle
        cx={center}
        cy={center}
        r={radius}
        stroke={colors.player.o}
        strokeWidth={MARK_STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animatedProps={animatedProps}
        fill="none"
        rotation="-90"
        origin={`${center}, ${center}`}
      />
    </Svg>
  );
}
