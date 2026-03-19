import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing } from '../src/theme/spacing';
import { useStatsStore } from '../src/store/stats-store';
import { useGameStore } from '../src/store/game-store';
import { animations } from '../src/theme/animations';

export default function HomeScreen() {
  const totalGames = useStatsStore((s) => s.totalGames);
  const stats = useStatsStore((s) => s.stats);
  const setGameMode = useGameStore((s) => s.setGameMode);
  const resetGame = useGameStore((s) => s.resetGame);

  const totalWins = stats.easy.wins + stats.medium.wins + stats.hard.wins;
  const totalLosses = stats.easy.losses + stats.medium.losses + stats.hard.losses;

  // Entrance animations
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);
  const statsOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600 });
    titleTranslateY.value = withSpring(0, animations.spring.gentle);

    subtitleOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));

    buttonOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
    buttonTranslateY.value = withDelay(400, withSpring(0, animations.spring.gentle));

    statsOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }));

  const handleVsAI = () => {
    setGameMode('ai');
    router.push('/difficulty');
  };

  const handleLocal2P = () => {
    setGameMode('local');
    resetGame();
    router.push('/game');
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Animated.View style={titleStyle}>
            <Text style={styles.title}>TIC TAC TOE</Text>
          </Animated.View>
          <Animated.View style={subtitleStyle}>
            <Text style={styles.subtitle}>by Cheddr</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.buttonGroup, buttonStyle]}>
          <Button
            title="vs AI"
            onPress={handleVsAI}
            size="lg"
            style={styles.mainButton}
          />
          <Button
            title="Local 2P"
            onPress={handleLocal2P}
            variant="secondary"
            size="lg"
            style={styles.mainButton}
          />
          <Button
            title="Online (Coming Soon)"
            onPress={() => {}}
            variant="secondary"
            size="md"
            disabled
          />
          <Button
            title="Settings"
            onPress={() => router.push('/settings')}
            variant="ghost"
            size="sm"
          />
        </Animated.View>

        {totalGames > 0 && (
          <Animated.View style={[styles.statsPreview, statsStyle]}>
            <Text style={styles.statsText}>
              {totalGames} games played
            </Text>
            <Text style={styles.statsDetail}>
              {totalWins}W · {totalLosses}L · {totalGames - totalWins - totalLosses}D
            </Text>
          </Animated.View>
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    gap: spacing['4xl'],
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size['5xl'],
    fontWeight: typography.weight.bold,
    color: colors.accent.gold,
    letterSpacing: 4,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
    color: colors.text.muted,
    letterSpacing: 2,
  },
  buttonGroup: {
    alignItems: 'center',
    gap: spacing.lg,
    width: '100%',
    maxWidth: 280,
  },
  mainButton: {
    width: '100%',
  },
  statsPreview: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statsText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.text.muted,
  },
  statsDetail: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    color: colors.text.secondary,
  },
});
