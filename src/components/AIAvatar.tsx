import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { useGameStore } from '../store/game-store';
import { getRandomTaunt } from '../engine/ai-personalities';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { animations } from '../theme/animations';

export function AIAvatar() {
  const { personality, isAIThinking, result } = useGameStore();
  const [taunt, setTaunt] = useState('');

  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    if (!personality) return;

    if (isAIThinking) {
      setTaunt(getRandomTaunt(personality.taunts.onThinking));
      // Animate dots
      const dur = 300;
      dot1.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: dur }),
          withTiming(0, { duration: dur }),
        ),
        -1,
      );
      dot2.value = withRepeat(
        withSequence(
          withTiming(0, { duration: dur / 3 }),
          withTiming(-6, { duration: dur }),
          withTiming(0, { duration: dur }),
        ),
        -1,
      );
      dot3.value = withRepeat(
        withSequence(
          withTiming(0, { duration: (dur * 2) / 3 }),
          withTiming(-6, { duration: dur }),
          withTiming(0, { duration: dur }),
        ),
        -1,
      );
    } else {
      cancelAnimation(dot1);
      cancelAnimation(dot2);
      cancelAnimation(dot3);
      dot1.value = 0;
      dot2.value = 0;
      dot3.value = 0;

      if (result.status === 'win') {
        setTaunt(
          getRandomTaunt(
            result.winner === 'O'
              ? personality.taunts.onWin
              : personality.taunts.onLose,
          ),
        );
      } else if (result.status === 'draw') {
        setTaunt(getRandomTaunt(personality.taunts.onDraw));
      } else {
        setTaunt('');
      }
    }
  }, [isAIThinking, result, personality]);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }));
  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }));
  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value }],
  }));

  if (!personality) return null;

  return (
    <View style={styles.container}>
      <View style={styles.avatarRow}>
        <Text style={styles.emoji}>{personality.emoji}</Text>
        <View>
          <Text style={styles.name}>{personality.name}</Text>
          <Text style={styles.difficulty}>{personality.difficulty}</Text>
        </View>
        {isAIThinking && (
          <View style={styles.dots}>
            <Animated.View style={[styles.dot, dot1Style]} />
            <Animated.View style={[styles.dot, dot2Style]} />
            <Animated.View style={[styles.dot, dot3Style]} />
          </View>
        )}
      </View>
      {taunt ? (
        <View style={styles.bubble}>
          <Text style={styles.tauntText}>{taunt}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emoji: {
    fontSize: 36,
  },
  name: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  difficulty: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.text.muted,
    textTransform: 'capitalize',
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.gold,
  },
  bubble: {
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    maxWidth: 280,
  },
  tauntText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    color: colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
