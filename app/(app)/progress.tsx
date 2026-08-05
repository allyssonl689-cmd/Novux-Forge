import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScoreRing } from '@/components/stats/ScoreRing';
import { Severity } from '@/features/stats/insights';
import { MuscleVolume } from '@/features/stats/statsService';
import { useTrainingStats } from '@/features/stats/useStats';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { fonts, radius, spacing, typography } from '@/theme';

const SEVERITY_ICON: Record<Severity, React.ComponentProps<typeof Feather>['name']> = {
  positive: 'check-circle',
  info: 'info',
  warning: 'alert-triangle',
  critical: 'alert-octagon',
};

function severityColor(colors: ThemeColors, s: Severity): string {
  if (s === 'positive') return colors.feedback.success;
  if (s === 'warning') return colors.amber.default;
  if (s === 'critical') return colors.feedback.danger;
  return colors.text.secondary;
}

function formatVol(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t`;
  return `${Math.round(kg)} kg`;
}

export default function ProgressScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data: stats, isLoading, isRefetching, refetch } = useTrainingStats();

  const maxMuscle = stats?.volumeByMuscle[0]?.volumeKg ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progresso</Text>
        <View style={styles.headerBtn} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent.default} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          onScrollEndDrag={() => { if (!isRefetching) refetch(); }}
        >
          {/* Score */}
          <Text style={styles.sectionLabel}>Score de treino</Text>
          <View style={styles.card}>
            {stats?.hasData ? (
              <ScoreRing score={stats.score} />
            ) : (
              <Text style={styles.muted}>
                Complete treinos para desbloquear seu score. Ele mede consistência, volume,
                progressão e equilíbrio muscular.
              </Text>
            )}
          </View>

          {/* Volume por grupo muscular (7 dias) */}
          {stats?.hasData && stats.volumeByMuscle.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Volume por grupo · últimos 7 dias</Text>
              <View style={styles.card}>
                {stats.volumeByMuscle.map((m) => (
                  <MuscleBar key={m.muscle} item={m} max={maxMuscle} colors={colors} />
                ))}
              </View>
            </>
          )}

          {/* Insights */}
          {stats && stats.insights.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Orientações</Text>
              <View style={styles.insights}>
                {stats.insights.map((ins) => (
                  <View key={ins.id} style={styles.insightCard}>
                    <Feather
                      name={SEVERITY_ICON[ins.severity]}
                      size={16}
                      color={severityColor(colors, ins.severity)}
                      style={styles.insightIcon}
                    />
                    <View style={styles.insightText}>
                      <Text style={styles.insightTitle}>{ins.title}</Text>
                      {ins.action && <Text style={styles.insightAction}>{ins.action}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function MuscleBar({ item, max, colors }: { item: MuscleVolume; max: number; colors: ThemeColors }) {
  const pct = max > 0 ? item.volumeKg / max : 0;
  return (
    <View style={{ gap: 4, paddingVertical: spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ ...typography.body, color: colors.text.primary }}>{item.muscle}</Text>
        <Text style={{ fontFamily: fonts.numSemiBold, fontSize: 13, color: colors.text.secondary }}>
          {formatVol(item.volumeKg)}
        </Text>
      </View>
      <View style={{ height: 8, borderRadius: radius.full, backgroundColor: colors.bg.elevated, overflow: 'hidden' }}>
        <View style={{ height: 8, width: `${Math.max(4, pct * 100)}%`, backgroundColor: colors.accent.default, borderRadius: radius.full }} />
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg.base },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
    },
    headerBtn: { width: 38, alignItems: 'center' },
    headerTitle: { ...typography.subheading, color: colors.text.primary },

    scroll: { padding: spacing['2xl'], gap: spacing.sm, paddingBottom: spacing['4xl'] },

    sectionLabel: {
      ...typography.label,
      color: colors.text.secondary,
      marginTop: spacing.lg,
      marginBottom: spacing.xs,
    },
    card: {
      backgroundColor: colors.bg.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border.default,
      padding: spacing.lg,
    },
    muted: { ...typography.body, color: colors.text.secondary },

    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    insights: { gap: spacing.sm },
    insightCard: {
      flexDirection: 'row',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: colors.bg.surface,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    insightIcon: { marginTop: 2 },
    insightText: { flex: 1, gap: 2 },
    insightTitle: { ...typography.body, color: colors.text.primary },
    insightAction: { ...typography.bodySmall, color: colors.text.secondary },
  });
