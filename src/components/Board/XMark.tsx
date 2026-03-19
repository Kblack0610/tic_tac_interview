import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { animations } from '../../theme/animations';
import { MARK_PADDING_RATIO, MARK_STROKE_WIDTH } from '../../constants';

const AnimatedLine = Animated.createAnimatedComponent(Line);

interface XMarkProps {
  size: number;
  animate?: boolean;
}

export function XMark({ size, animate = true }: XMarkProps) {
  const padding = size * MARK_PADDING_RATIO;
  const start = padding;
  const end = size - padding;

  const progress1 = useSharedValue(animate ? 0 : 1);
  const progress2 = useSharedValue(animate ? 0 : 1);

  useEffect(() => {
    if (animate) {
      progress1.value = withTiming(1, {
        duration: animations.duration.fast,
        easing: animations.easing.smooth,
      });
      progress2.value = withDelay(
        100,
        withTiming(1, {
          duration: animations.duration.fast,
          easing: animations.easing.smooth,
        }),
      );
    }
  }, [animate]);

  const line1Props = useAnimatedProps(() => ({
    x2: start + (end - start) * progress1.value,
    y2: start + (end - start) * progress1.value,
  }));

  const line2Props = useAnimatedProps(() => ({
    x2: end - (end - start) * progress2.value,
    y2: start + (end - start) * progress2.value,
  }));

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <AnimatedLine
        x1={start}
        y1={start}
        animatedProps={line1Props}
        stroke={colors.player.x}
        strokeWidth={MARK_STROKE_WIDTH}
        strokeLinecap="round"
      />
      <AnimatedLine
        x1={end}
        y1={start}
        animatedProps={line2Props}
        stroke={colors.player.x}
        strokeWidth={MARK_STROKE_WIDTH}
        strokeLinecap="round"
      />
    </Svg>
  );
}
