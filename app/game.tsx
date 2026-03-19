import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from '../src/components/GradientBackground';
import { Board } from '../src/components/Board';
import { GameHeader } from '../src/components/GameHeader';
import { LocalGameHeader } from '../src/components/LocalGameHeader';
import { AIAvatar } from '../src/components/AIAvatar';
import { Button } from '../src/components/Button';
import { CelebrationOverlay } from '../src/components/CelebrationOverlay';
import { useGameStore } from '../src/store/game-store';
import { useGameLoop } from '../src/hooks/useGameLoop';
import { useLocalGameLoop } from '../src/hooks/useLocalGameLoop';
import { spacing } from '../src/theme/spacing';
import { HUMAN_PLAYER } from '../src/constants';

export default function GameScreen() {
  const { result, personality, gameMode, resetGame } = useGameStore();

  // Redirect if AI mode with no personality selected
  useEffect(() => {
    if (gameMode === 'ai' && !personality) {
      router.replace('/difficulty');
    }
  }, [personality, gameMode]);

  // Run the appropriate game loop
  useGameLoop();
  useLocalGameLoop();

  const isGameOver = result.status !== 'playing';

  const celebrationType =
    result.status === 'win'
      ? result.winner === HUMAN_PLAYER
        ? 'win'
        : 'lose'
      : result.status === 'draw'
        ? 'draw'
        : 'win';

  const backDestination = gameMode === 'ai' ? '/difficulty' : '/';

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

        {gameMode === 'ai' && <AIAvatar />}
        {gameMode === 'ai' ? <GameHeader /> : <LocalGameHeader />}
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
              title={gameMode === 'ai' ? 'Change Opponent' : 'Back to Menu'}
              onPress={() => router.replace(backDestination)}
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
