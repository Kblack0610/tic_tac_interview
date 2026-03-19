import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { AI_PERSONALITIES, AIPersonality } from '../src/engine';
import { useGameStore } from '../src/store/game-store';
import { useHaptics } from '../src/hooks/useHaptics';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing, borderRadius } from '../src/theme/spacing';
import { animations } from '../src/theme/animations';

function DifficultyCard({
  personality,
  index,
  selected,
  onSelect,
}: {
  personality: AIPersonality;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-30);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      index * animations.stagger.cards,
      withTiming(1, { duration: 400 }),
    );
    translateX.value = withDelay(
      index * animations.stagger.cards,
      withSpring(0, animations.spring.gentle),
    );
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  const difficultyColor =
    personality.difficulty === 'easy'
      ? colors.status.win
      : personality.difficulty === 'medium'
        ? colors.status.draw
        : colors.status.lose;

  return (
    <Animated.View style={cardStyle}>
      <Pressable
        onPress={onSelect}
        style={[
          styles.card,
          selected && { borderColor: difficultyColor, borderWidth: 2 },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.emoji}>{personality.emoji}</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{personality.name}</Text>
            <Text style={[styles.cardDifficulty, { color: difficultyColor }]}>
              {personality.difficulty.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>{personality.description}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function DifficultyScreen() {
  const { setPersonality, resetGame, personality: currentPersonality } = useGameStore();
  const haptics = useHaptics();

  const handleSelect = (personality: AIPersonality) => {
    haptics.light();
    setPersonality(personality);
  };

  const handleStart = () => {
    if (!currentPersonality) return;
    resetGame();
    router.push('/game');
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title="← Back"
            onPress={() => router.back()}
            variant="ghost"
            size="sm"
          />
          <Text style={styles.title}>Choose Opponent</Text>
        </View>

        <View style={styles.cards}>
          {AI_PERSONALITIES.map((p, i) => (
            <DifficultyCard
              key={p.id}
              personality={p}
              index={i}
              selected={currentPersonality?.id === p.id}
              onSelect={() => handleSelect(p)}
            />
          ))}
        </View>

        <Button
          title="Start Game"
          onPress={handleStart}
          size="lg"
          disabled={!currentPersonality}
          style={styles.startButton}
        />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing['3xl'],
    gap: spacing['2xl'],
  },
  header: {
    gap: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  cards: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emoji: {
    fontSize: 36,
  },
  cardInfo: {
    gap: 2,
  },
  cardName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  cardDifficulty: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: 2,
  },
  cardDescription: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    color: colors.text.secondary,
  },
  startButton: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 280,
  },
});
