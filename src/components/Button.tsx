import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { animations } from '../theme/animations';
import { useHaptics } from '../hooks/useHaptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const haptics = useHaptics();

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, animations.spring.button);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animations.spring.button);
  }, []);

  const handlePress = useCallback(() => {
    haptics.light();
    onPress();
  }, [onPress, haptics]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const variantStyles: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: colors.accent.gold,
    },
    secondary: {
      backgroundColor: colors.bg.surface,
      borderWidth: 1,
      borderColor: colors.grid.line,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  const textColors: Record<string, string> = {
    primary: colors.bg.primary,
    secondary: colors.text.primary,
    ghost: colors.text.secondary,
  };

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
    md: { paddingHorizontal: spacing['2xl'], paddingVertical: spacing.md },
    lg: { paddingHorizontal: spacing['3xl'], paddingVertical: spacing.lg },
  };

  const textSizes: Record<string, number> = {
    sm: typography.size.sm,
    md: typography.size.base,
    lg: typography.size.lg,
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.base,
          variantStyles[variant],
          sizeStyles[size],
          disabled && styles.disabled,
          style,
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: disabled ? colors.text.muted : textColors[variant],
              fontSize: textSizes[size],
            },
          ]}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: typography.fontFamily,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
});
