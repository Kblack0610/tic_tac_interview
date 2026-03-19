import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../store/game-store';
import { useStatsStore } from '../store/stats-store';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

export function LocalGameHeader() {
  const { currentPlayer, result } = useGameStore();
  const localStats = useStatsStore((s) => s.localStats);

  const getStatusText = () => {
    if (result.status === 'win') {
      return `Player ${result.winner} wins!`;
    }
    if (result.status === 'draw') return "It's a draw!";
    return `Player ${currentPlayer}'s turn`;
  };

  const getStatusColor = () => {
    if (result.status === 'win') {
      return result.winner === 'X' ? colors.player.x : colors.player.o;
    }
    if (result.status === 'draw') return colors.status.draw;
    return currentPlayer === 'X' ? colors.player.x : colors.player.o;
  };

  const totalLocal = localStats.xWins + localStats.oWins + localStats.draws;

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <Text style={[styles.status, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      {totalLocal > 0 && (
        <View style={styles.scoreRow}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>X</Text>
            <Text style={[styles.scoreValue, { color: colors.player.x }]}>
              {localStats.xWins}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>D</Text>
            <Text style={[styles.scoreValue, { color: colors.status.draw }]}>
              {localStats.draws}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>O</Text>
            <Text style={[styles.scoreValue, { color: colors.player.o }]}>
              {localStats.oWins}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  status: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    gap: spacing.lg,
  },
  scoreItem: {
    alignItems: 'center',
    gap: 2,
  },
  scoreLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  scoreValue: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: colors.grid.line,
  },
});
