import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from '../src/components/GradientBackground';
import { Board } from '../src/components/Board';
import { GameHeader } from '../src/components/GameHeader';
import { AIAvatar } from '../src/components/AIAvatar';
import { Button } from '../src/components/Button';
import { CelebrationOverlay } from '../src/components/CelebrationOverlay';
import { useGameStore } from '../src/store/game-store';
import { useGameLoop } from '../src/hooks/useGameLoop';
import { colors } from '../src/theme/colors';
import { spacing } from '../src/theme/spacing';
import { HUMAN_PLAYER } from '../src/constants';

export default function GameScreen() {
  const { result, personality, resetGame } = useGameStore();

  // Redirect if no personality selected
  useEffect(() => {
    if (!personality) {
      router.replace('/difficulty');
    }
  }, [personality]);

  // Run the AI game loop
  useGameLoop();

  const isGameOver = result.status !== 'playing';

  const celebrationType =
    result.status === 'win'
      ? result.winner === HUMAN_PLAYER
        ? 'win'
        : 'lose'
      : result.status === 'draw'
        ? 'draw'
        : 'win';

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Button
            title="← Back"
            onPress={() => router.back()}
            variant="ghost"
            size="sm"
          />
        </View>

        <AIAvatar />
        <GameHeader />
        <Board />

        {isGameOver && (
          <View style={styles.gameOverActions}>
            <Button
              title="Play Again"
              onPress={resetGame}
              size="lg"
              style={styles.playAgainButton}
            />
            <Button
              title="Change Opponent"
              onPress={() => router.replace('/difficulty')}
              variant="secondary"
              size="md"
            />
          </View>
        )}
      </ScrollView>

      <CelebrationOverlay
        visible={isGameOver}
        type={celebrationType}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['4xl'],
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
    alignItems: 'center',
  },
  topBar: {
    alignSelf: 'flex-start',
  },
  gameOverActions: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  playAgainButton: {
    minWidth: 200,
  },
});
