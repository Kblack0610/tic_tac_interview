import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { animations } from '../../theme/animations';
import { WinLine as WinLineType } from '../../engine/types';

const AnimatedLine = Animated.createAnimatedComponent(Line);

interface WinLineProps {
  line: WinLineType;
  cellSize: number;
  gap: number;
  padding: number;
}

function getCellCenter(index: number, cellSize: number, gap: number, padding: number) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  return {
    x: padding + col * (cellSize + gap) + cellSize / 2,
    y: padding + row * (cellSize + gap) + cellSize / 2,
  };
}

export function WinLine({ line, cellSize, gap, padding }: WinLineProps) {
  const start = getCellCenter(line[0], cellSize, gap, padding);
  const end = getCellCenter(line[2], cellSize, gap, padding);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: animations.duration.normal,
      easing: animations.easing.smooth,
    });
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    x2: start.x + (end.x - start.x) * progress.value,
    y2: start.y + (end.y - start.y) * progress.value,
  }));

  const totalWidth = padding * 2 + cellSize * 3 + gap * 2;

  return (
    <Svg
      width={totalWidth}
      height={totalWidth}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <AnimatedLine
        x1={start.x}
        y1={start.y}
        animatedProps={animatedProps}
        stroke={colors.accent.gold}
        strokeWidth={4}
        strokeLinecap="round"
      />
    </Svg>
  );
}
