import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, useConfirm } from '@/components/ui';
import {
  EQUIPMENT_LABEL,
  GOAL_LABEL,
  LEVEL_LABEL,
  SplitDay,
} from '@/features/splits/splitService';
import { useAppliedSplitDays, useApplySplit, useSplitDetail } from '@/features/splits/useSplits';
import { buildSchedule } from '@/features/plan/recommendation';
import { useSetWeeklyPlan, useWeeklyPlan } from '@/features/plan/useWeeklyPlan';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const haptics = useHaptics();
  const confirm = useConfirm();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: split, isLoading } = useSplitDetail(String(id));
  const { data: appliedDayIds = [] } = useAppliedSplitDays();
  const { data: weeklyPlan = [] } = useWeeklyPlan();
  const applySplit = useApplySplit();
  const setWeeklyPlan = useSetWeeklyPlan();

  const [openDay, setOpenDay] = useState<number>(0);

  const alreadyApplied =
    !!split && split.days.length > 0 && split.days.every((d) => appliedDayIds.includes(d.id));

  async function handleApply() {
    if (!split) return;

    async function run() {
      if (!split) return;
      try {
        const workouts = await applySplit.mutateAsync(split);

        // Agenda vazia: já distribui as fichas novas nos dias da semana.
        // Se o usuário já tem agenda, não mexemos — ela é dele.
        let scheduled = false;
        if (weeklyPlan.length === 0) {
          const schedule = buildSchedule(split.days_per_week, workouts);
          await setWeeklyPlan.mutateAsync(
            schedule.map((s) => ({ weekday: s.weekday, workout_id: s.workout.id })),
          );
          scheduled = true;
        }

        haptics.success();
        const next = await confirm({
          title: 'Plano aplicado',
          message:
            `${workouts.length} ficha${workouts.length > 1 ? 's' : ''} criada${workouts.length > 1 ? 's' : ''}.` +
            (scheduled
              ? ' Já deixei a semana montada — dá para trocar os dias na agenda.'
              : ' Sua agenda da semana não foi alterada.'),
          actions: [
            { key: 'workouts', label: 'Ver minhas fichas', variant: 'secondary' },
            { key: 'schedule', label: 'Ajustar agenda' },
          ],
        });
        if (next === 'workouts') router.replace('/(app)/workouts');
        if (next === 'schedule') router.replace('/(app)/workouts/schedule');
      } catch {
        haptics.error();
        confirm({ title: 'Erro', message: 'Não foi possível criar as fichas. Tente novamente.', actions: [{ key: 'ok', label: 'OK' }] });
      }
    }

    if (alreadyApplied) {
      const action = await confirm({
        title: 'Plano já aplicado',
        message: 'Você já tem as fichas deste plano. Aplicar de novo vai criar cópias duplicadas.',
        actions: [
          { key: 'cancel', label: 'Cancelar', variant: 'secondary' },
          { key: 'apply', label: 'Criar mesmo assim' },
        ],
      });
      if (action === 'apply') run();
      return;
    }

    const action = await confirm({
      title: 'Usar este plano',
      message: `Serão criadas ${split.days.length} fichas — uma para cada dia da divisão. Suas fichas atuais não são alteradas.`,
      actions: [
        { key: 'cancel', label: 'Cancelar', variant: 'secondary' },
        { key: 'apply', label: 'Criar fichas' },
      ],
    });
    if (action === 'apply') run();
  }

  if (isLoading || !split) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent.default} />
        </View>
      </SafeAreaView>
    );
  }

  const totalExercises = split.days.reduce((acc, d) => acc + d.exercises.length, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{split.name}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {split.subtitle && <Text style={styles.subtitle}>{split.subtitle}</Text>}

        <View style={styles.tags}>
          <Tag label={LEVEL_LABEL[split.level]} highlight={split.level === 'beginner'} />
          <Tag label={GOAL_LABEL[split.goal]} />
          <Tag label={EQUIPMENT_LABEL[split.equipment_profile]} />
          <Tag label={`${split.days_per_week}x por semana`} />
        </View>

        {split.description && <Text style={styles.description}>{split.description}</Text>}

        {alreadyApplied && (
          <View style={styles.appliedBanner}>
            <Feather name="check-circle" size={16} color={colors.feedback.success} />
            <Text style={styles.appliedText}>Você já tem as fichas deste plano</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>
          {split.days.length} dias · {totalExercises} exercícios
        </Text>

        {split.days.map((day) => (
          <DayCard
            key={day.id}
            day={day}
            expanded={openDay === day.day_index}
            onToggle={() => setOpenDay(openDay === day.day_index ? -1 : day.day_index)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={`Usar este plano · cria ${split.days.length} fichas`}
          onPress={handleApply}
          loading={applySplit.isPending}
        />
      </View>
    </SafeAreaView>
  );
}

function DayCard({
  day,
  expanded,
  onToggle,
}: {
  day: SplitDay;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.dayCard}>
      <TouchableOpacity style={styles.dayHeader} onPress={onToggle} activeOpacity={0.75}>
        <View style={styles.dayBadge}>
          <Text style={styles.dayBadgeText}>{day.label}</Text>
        </View>
        <View style={styles.dayTitleWrapper}>
          <Text style={styles.dayName}>{day.name}</Text>
          <Text style={styles.dayMeta}>{day.exercises.length} exercícios</Text>
        </View>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.text.secondary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.dayBody}>
          {day.focus.length > 0 && (
            <View style={styles.focusRow}>
              {day.focus.map((f) => (
                <View key={f} style={styles.focusChip}>
                  <Text style={styles.focusLabel}>{f}</Text>
                </View>
              ))}
            </View>
          )}

          {day.exercises.map((ex, i) => (
            <View key={ex.id} style={styles.exRow}>
              <Text style={styles.exOrder}>{i + 1}</Text>
              <View style={styles.exTextWrapper}>
                <Text style={styles.exName} numberOfLines={1}>{ex.exercise_name}</Text>
                <Text style={styles.exMeta}>
                  {ex.muscle_group} · descanso {ex.rest_seconds}s
                </Text>
              </View>
              <Text style={styles.exPrescription}>
                {ex.sets} × {ex.rep_range ?? (ex.is_time_based ? `${ex.reps}s` : ex.reps)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function Tag({ label, highlight }: { label: string; highlight?: boolean }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[styles.tag, highlight && styles.tagHighlight]}>
      <Text style={[styles.tagLabel, highlight && styles.tagLabelHighlight]}>{label}</Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.base },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerBtn: { width: 38, alignItems: 'center' },
  headerTitle: { ...typography.subheading, color: colors.text.primary, flex: 1, textAlign: 'center' },

  scroll: { padding: spacing['2xl'], paddingBottom: spacing['3xl'], gap: spacing.md },
  subtitle: { ...typography.body, color: colors.text.secondary },
  description: { ...typography.body, color: colors.text.secondary },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
  },
  tagHighlight: { backgroundColor: colors.amber.dim, borderWidth: 1, borderColor: colors.amber.border },
  tagLabel: { ...typography.labelSmall, color: colors.text.secondary },
  tagLabelHighlight: { color: colors.amber.default },

  appliedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(45,212,164,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(45,212,164,0.25)',
  },
  appliedText: { ...typography.bodySmall, color: colors.feedback.success },

  sectionLabel: {
    ...typography.label,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },

  dayCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  dayBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.accent.dim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeText: { ...typography.labelSmall, color: colors.accent.default },
  dayTitleWrapper: { flex: 1, gap: 2 },
  dayName: { ...typography.subheading, color: colors.text.primary },
  dayMeta: { ...typography.bodySmall, color: colors.text.secondary },

  dayBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing.md,
  },
  focusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  focusChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.bg.elevated,
  },
  focusLabel: { ...typography.labelSmall, color: colors.text.tertiary },

  exRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  exOrder: { ...typography.labelSmall, color: colors.text.tertiary, width: 14 },
  exTextWrapper: { flex: 1, gap: 1 },
  exName: { ...typography.body, color: colors.text.primary },
  exMeta: { ...typography.bodySmall, color: colors.text.tertiary },
  exPrescription: { ...typography.label, color: colors.accent.default },

  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    backgroundColor: colors.bg.surface,
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
