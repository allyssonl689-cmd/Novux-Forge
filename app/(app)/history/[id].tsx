import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeScreen } from '@/components/layout';
import { ScreenHeader } from '@/components/layout';
import { useWorkoutLogDetail } from '@/features/history/useHistory';
import { WorkoutLogDetail } from '@/features/history/historyService';
import { formatTime, formatKg } from '@/lib/utils';

type ExerciseLog = WorkoutLogDetail['exercise_logs'][number];
type SetLog = ExerciseLog['set_logs'][number];
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t`;
  return `${kg.toFixed(0)} kg`;
}

function SummaryChip({ icon, label }: { icon: React.ComponentProps<typeof Feather>['name']; label: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.chip}>
      <Feather name={icon} size={14} color={colors.accent.default} />
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

export default function WorkoutLogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data: log, isLoading, isError } = useWorkoutLogDetail(id ?? null);

  if (isLoading) {
    return (
      <SafeScreen>
        <ScreenHeader title="Treino" showBack />
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent.default} size="large" />
        </View>
      </SafeScreen>
    );
  }

  if (isError || !log) {
    return (
      <SafeScreen>
        <ScreenHeader title="Treino" showBack />
        <View style={styles.center}>
          <Feather name="alert-circle" size={32} color={colors.feedback.danger} />
          <Text style={styles.muted}>Treino não encontrado</Text>
        </View>
      </SafeScreen>
    );
  }

  const totalSets = log.exercise_logs.reduce(
    (acc: number, el: ExerciseLog) => acc + el.set_logs.filter((s: SetLog) => !s.is_warmup).length,
    0,
  );
  const totalPRs = log.exercise_logs.reduce(
    (acc: number, el: ExerciseLog) => acc + el.set_logs.filter((s: SetLog) => s.is_personal_record).length,
    0,
  );

  return (
    <SafeScreen style={styles.screen}>
      <ScreenHeader title={log.name} showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Data */}
        <Text style={styles.date}>{formatDate(log.started_at)}</Text>

        {/* Resumo em chips */}
        <View style={styles.chipsRow}>
          {log.duration_secs != null && (
            <SummaryChip icon="clock" label={formatTime(log.duration_secs)} />
          )}
          <SummaryChip icon="activity" label={`${log.exercise_logs.length} exercícios`} />
          <SummaryChip icon="layers" label={`${totalSets} séries`} />
          <SummaryChip icon="trending-up" label={formatVolume(log.total_volume_kg)} />
          {totalPRs > 0 && (
            <SummaryChip icon="award" label={`${totalPRs} PR${totalPRs > 1 ? 's' : ''}`} />
          )}
        </View>

        {/* Exercícios com suas séries */}
        {log.exercise_logs.map((el: ExerciseLog) => (
          <View key={el.id} style={styles.exerciseBlock}>
            <Text style={styles.exerciseName}>{el.exercise_name}</Text>

            {/* Cabeçalho da tabela */}
            <View style={styles.tableHeader}>
              <Text style={[styles.col, styles.colNum]}>Série</Text>
              <Text style={[styles.col, styles.colData]}>Peso</Text>
              <Text style={[styles.col, styles.colData]}>Reps</Text>
              <Text style={[styles.col, styles.colData]}>Vol.</Text>
              <Text style={[styles.col, { width: 28 }]}></Text>
            </View>

            {/* Linhas de série */}
            {el.set_logs.map((s: SetLog) => {
              const vol = s.weight_kg && s.reps ? s.weight_kg * s.reps : null;
              return (
                <View
                  key={s.id}
                  style={[styles.setRow, s.is_warmup && styles.setRowWarmup]}
                >
                  <Text style={[styles.col, styles.colNum, styles.colText]}>
                    {s.is_warmup ? 'Q' : s.set_number}
                  </Text>
                  <Text style={[styles.col, styles.colData, styles.colText]}>
                    {s.weight_kg != null ? formatKg(s.weight_kg) : 'PC'}
                  </Text>
                  <Text style={[styles.col, styles.colData, styles.colText]}>
                    {s.reps ?? (s.duration_secs ? formatTime(s.duration_secs) : '—')}
                  </Text>
                  <Text style={[styles.col, styles.colData, styles.colText]}>
                    {vol != null ? `${vol} kg` : '—'}
                  </Text>
                  <View style={{ width: 28, alignItems: 'center' }}>
                    {s.is_personal_record && (
                      <View style={styles.prBadge}>
                        <Text style={styles.prText}>PR</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* Notas do treino */}
        {log.notes && (
          <View style={styles.notesBox}>
            <Feather name="file-text" size={14} color={colors.text.tertiary} />
            <Text style={styles.notesText}>{log.notes}</Text>
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: {},
  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  muted:  { ...typography.body, color: colors.text.secondary },

  date: { ...typography.bodySmall, color: colors.text.secondary, textTransform: 'capitalize' },

  // Chips de resumo
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipLabel: { ...typography.label, color: colors.text.secondary },

  // Bloco de exercício
  exerciseBlock: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  exerciseName: { ...typography.subheading, color: colors.text.primary, marginBottom: spacing.xs },

  // Tabela de séries
  tableHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  setRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  setRowWarmup: { opacity: 0.6 },
  col:     { ...typography.bodySmall, color: colors.text.secondary },
  colNum:  { width: 36, textAlign: 'center' },
  colData: { flex: 1, textAlign: 'center' },
  colText: { color: colors.text.primary },

  // PR badge
  prBadge: {
    backgroundColor: colors.amber.dim,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.amber.border,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  prText: { ...typography.labelSmall, color: colors.amber.default },

  // Notas
  notesBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  notesText: { ...typography.body, color: colors.text.secondary, flex: 1 },
});
