import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { CellIndex, CellValue } from '../../engine/types';
import { XMark } from './XMark';
import { OMark } from './OMark';
import { colors } from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';
import { animations } from '../../theme/animations';
import { useHaptics } from '../../hooks/useHaptics';

interface CellProps {
  index: CellIndex;
  value: CellValue;
  size: number;
  disabled: boolean;
  isWinning: boolean;
  isLastMove: boolean;
  onPress: (index: CellIndex) => void;
}

export function Cell({
  index, value, size, disabled, isWinning, isLastMove, onPress,
}: CellProps) {
  const scale = useSharedValue(1);
  const haptics = useHaptics();

  const handlePress = useCallback(() => {
    if (disabled || value !== null) return;
    scale.value = withSpring(0.92, animations.spring.button, () => {
      scale.value = withSpring(1, animations.spring.button);
    });
    haptics.light();
    onPress(index);
  }, [disabled, value, index, onPress, haptics]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dimStyle = isWinning
    ? undefined
    : value !== null && !isLastMove
      ? { opacity: 0.4 }
      : undefined;

  return (
    <Animated.View style={[animatedStyle]}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.cell,
          {
            width: size,
            height: size,
          },
          isWinning && styles.winning,
          dimStyle,
        ]}
      >
        {value === 'X' && <XMark size={size} />}
        {value === 'O' && <OMark size={size} />}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cell: {
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winning: {
    backgroundColor: colors.bg.elevated,
  },
});
