import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../store/game-store';
import { useStatsStore } from '../store/stats-store';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { HUMAN_PLAYER, AI_PLAYER } from '../constants';

export function GameHeader() {
  const { currentPlayer, result, personality, isAIThinking } = useGameStore();
  const stats = useStatsStore((s) => personality ? s.stats[personality.difficulty] : null);

  const getStatusText = () => {
    if (result.status === 'win') {
      return result.winner === HUMAN_PLAYER ? 'You win!' : `${personality?.name} wins!`;
    }
    if (result.status === 'draw') return "It's a draw!";
    if (isAIThinking) return `${personality?.emoji} Thinking...`;
    return 'Your turn';
  };

  const getStatusColor = () => {
    if (result.status === 'win') {
      return result.winner === HUMAN_PLAYER ? colors.status.win : colors.status.lose;
    }
    if (result.status === 'draw') return colors.status.draw;
    return colors.text.primary;
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <Text style={[styles.status, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      {stats && (
        <View style={styles.scoreRow}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>W</Text>
            <Text style={[styles.scoreValue, { color: colors.status.win }]}>
              {stats.wins}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>D</Text>
            <Text style={[styles.scoreValue, { color: colors.status.draw }]}>
              {stats.draws}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>L</Text>
            <Text style={[styles.scoreValue, { color: colors.status.lose }]}>
              {stats.losses}
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
