import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../store/game-store';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

export function OnlineGameHeader() {
  const { currentPlayer, result, playerMark, opponentConnected, roomCode } = useGameStore();

  const getStatusText = () => {
    if (!opponentConnected) return 'Waiting for opponent...';
    if (result.status === 'win') {
      return result.winner === playerMark ? 'You win!' : 'Opponent wins!';
    }
    if (result.status === 'draw') return "It's a draw!";
    return currentPlayer === playerMark ? 'Your turn' : "Opponent's turn";
  };

  const getStatusColor = () => {
    if (!opponentConnected) return colors.text.muted;
    if (result.status === 'win') {
      return result.winner === playerMark ? colors.status.win : colors.status.lose;
    }
    if (result.status === 'draw') return colors.status.draw;
    return currentPlayer === playerMark ? colors.player.x : colors.player.o;
  };

  return (
    <View style={styles.container}>
      {roomCode && (
        <View style={styles.codeRow}>
          <Text style={styles.codeLabel}>Room</Text>
          <Text style={styles.codeValue}>{roomCode}</Text>
          <View style={[styles.dot, { backgroundColor: opponentConnected ? colors.status.win : colors.text.muted }]} />
        </View>
      )}
      <Text style={[styles.status, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
      {playerMark && (
        <Text style={styles.markLabel}>You are {playerMark}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  codeLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  codeValue: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.accent.gold,
    letterSpacing: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  status: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
  },
  markLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.text.secondary,
  },
});
