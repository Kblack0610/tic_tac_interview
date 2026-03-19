import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { useSettingsStore } from '../src/store/settings-store';
import { useStatsStore } from '../src/store/stats-store';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing, borderRadius } from '../src/theme/spacing';
import { Difficulty } from '../src/engine/types';

function SettingRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.bg.elevated, true: colors.accent.gold }}
        thumbColor={colors.text.primary}
      />
    </View>
  );
}

function StatRow({
  difficulty,
  wins,
  losses,
  draws,
}: {
  difficulty: string;
  wins: number;
  losses: number;
  draws: number;
}) {
  const total = wins + losses + draws;
  if (total === 0) return null;

  return (
    <View style={styles.statRow}>
      <Text style={styles.statDifficulty}>{difficulty}</Text>
      <View style={styles.statValues}>
        <Text style={[styles.statValue, { color: colors.status.win }]}>{wins}W</Text>
        <Text style={[styles.statValue, { color: colors.status.lose }]}>{losses}L</Text>
        <Text style={[styles.statValue, { color: colors.status.draw }]}>{draws}D</Text>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { soundEnabled, hapticsEnabled, toggleSound, toggleHaptics } =
    useSettingsStore();
  const { stats, totalGames, resetStats } = useStatsStore();

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

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
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <SettingRow label="Sound" value={soundEnabled} onToggle={toggleSound} />
            <View style={styles.separator} />
            <SettingRow
              label="Haptics"
              value={hapticsEnabled}
              onToggle={toggleHaptics}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Statistics ({totalGames} games)
          </Text>
          <View style={styles.card}>
            {totalGames === 0 ? (
              <Text style={styles.emptyStats}>No games played yet</Text>
            ) : (
              difficulties.map((d) => (
                <StatRow
                  key={d}
                  difficulty={d}
                  wins={stats[d].wins}
                  losses={stats[d].losses}
                  draws={stats[d].draws}
                />
              ))
            )}
          </View>
          {totalGames > 0 && (
            <Button
              title="Reset Stats"
              onPress={resetStats}
              variant="ghost"
              size="sm"
            />
          )}
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
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  settingLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.grid.line,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  statDifficulty: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  statValues: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statValue: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  emptyStats: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    color: colors.text.muted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
