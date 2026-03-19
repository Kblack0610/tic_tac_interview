import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { useGameStore } from '../src/store/game-store';
import { useOnlineGame } from '../src/hooks/useOnlineGame';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing, borderRadius } from '../src/theme/spacing';

export default function LobbyScreen() {
  const [joinCode, setJoinCode] = useState('');
  const { roomCode, opponentConnected, gameMode } = useGameStore();
  const { createRoom, joinRoom } = useOnlineGame();

  // Navigate to game when opponent connects
  useEffect(() => {
    if (opponentConnected && gameMode === 'online') {
      router.replace('/game');
    }
  }, [opponentConnected, gameMode]);

  const handleCreate = () => {
    useGameStore.getState().resetGame();
    createRoom();
  };

  const handleJoin = () => {
    if (joinCode.length !== 4) return;
    useGameStore.getState().resetGame();
    joinRoom(joinCode);
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
          <Text style={styles.title}>Online Multiplayer</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Create a Room</Text>
            <Text style={styles.sectionDesc}>
              Start a new game and share the code with a friend.
            </Text>
            <Button
              title="Create Room"
              onPress={handleCreate}
              size="lg"
              style={styles.actionButton}
            />
            {roomCode && !opponentConnected && (
              <View style={styles.codeDisplay}>
                <Text style={styles.codeLabel}>Share this code:</Text>
                <Text style={styles.codeValue}>{roomCode}</Text>
                <Text style={styles.waitingText}>Waiting for opponent...</Text>
              </View>
            )}
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Join a Room</Text>
            <Text style={styles.sectionDesc}>
              Enter the 4-character room code.
            </Text>
            <TextInput
              style={styles.codeInput}
              value={joinCode}
              onChangeText={(text) => setJoinCode(text.toUpperCase().slice(0, 4))}
              placeholder="ABCD"
              placeholderTextColor={colors.text.muted}
              autoCapitalize="characters"
              maxLength={4}
            />
            <Button
              title="Join Room"
              onPress={handleJoin}
              variant="secondary"
              size="lg"
              disabled={joinCode.length !== 4}
              style={styles.actionButton}
            />
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing['3xl'],
  },
  section: {
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  sectionDesc: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actionButton: {
    width: '100%',
    maxWidth: 280,
  },
  codeDisplay: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
  },
  codeLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.text.secondary,
  },
  codeValue: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size['4xl'],
    fontWeight: typography.weight.bold,
    color: colors.accent.gold,
    letterSpacing: 8,
  },
  waitingText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    color: colors.text.muted,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.grid.line,
  },
  dividerText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.text.muted,
  },
  codeInput: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    textAlign: 'center',
    letterSpacing: 8,
    width: '100%',
    maxWidth: 200,
  },
});
