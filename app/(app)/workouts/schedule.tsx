import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WEEKDAY_LABEL } from '@/features/plan/recommendation';
import { useSetWeekdayWorkout, useWeeklyPlan } from '@/features/plan/useWeeklyPlan';
import { useWorkouts } from '@/features/workouts/useWorkouts';
import { useHaptics } from '@/hooks/useHaptics';
import { Skeleton, SkeletonGroup, useConfirm } from '@/components/ui';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

export default function ScheduleScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const confirm = useConfirm();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: weeklyPlan = [], isLoading } = useWeeklyPlan();
  const { data: workouts = [] } = useWorkouts();
  const setWeekdayWorkout = useSetWeekdayWorkout();

  const [editingDay, setEditingDay] = useState<number | null>(null);

  const todayWeekday = new Date().getDay();

  function pick(workoutId: string | null) {
    if (editingDay === null) return;
    const weekday = editingDay;
    setEditingDay(null);
    setWeekdayWorkout.mutate(
      { weekday, workoutId },
      {
        onSuccess: () => haptics.light(),
        onError: () => confirm({ title: 'Erro', message: 'Não foi possível salvar a agenda.', actions: [{ key: 'ok', label: 'OK' }] }),
      },
    );
  }

  const trainingDays = weeklyPlan.length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agenda da semana</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.intro}>
          {trainingDays === 0
            ? 'Escolha qual ficha treinar em cada dia. Os dias sem ficha são de descanso.'
            : `${trainingDays} ${trainingDays === 1 ? 'dia de treino' : 'dias de treino'} por semana. Toque em um dia para trocar a ficha.`}
        </Text>

        {isLoading ? (
          <SkeletonGroup gap={spacing.sm}>
            {WEEKDAY_LABEL.map((_, i) => (
              <Skeleton key={i} height={56} radius={radius.lg} />
            ))}
          </SkeletonGroup>
        ) : (
          WEEKDAY_LABEL.map((label, weekday) => {
            const entry = weeklyPlan.find((e) => e.weekday === weekday);
            const isToday = weekday === todayWeekday;
            return (
              <TouchableOpacity
                key={label}
                style={[styles.dayRow, isToday && styles.dayRowToday]}
                onPress={() => setEditingDay(weekday)}
                activeOpacity={0.75}
              >
                <View style={styles.dayLabelWrapper}>
                  <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{label}</Text>
                  {isToday && <Text style={styles.todayTag}>hoje</Text>}
                </View>

                <View style={styles.dayValueWrapper}>
                  {entry ? (
                    <>
                      <Text style={styles.dayWorkout} numberOfLines={1}>{entry.workout_name}</Text>
                      <Text style={styles.dayMeta}>
                        {entry.exercise_count} exercício{entry.exercise_count === 1 ? '' : 's'}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.dayRest}>Descanso</Text>
                  )}
                </View>

                <Feather name="chevron-right" size={18} color={colors.text.tertiary} />
              </TouchableOpacity>
            );
          })
        )}

        {workouts.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.muted}>
              Você ainda não tem fichas para agendar.
            </Text>
            <TouchableOpacity onPress={() => router.replace('/(app)/workouts/plans')}>
              <Text style={styles.link}>Ver planos prontos</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Seletor de ficha do dia */}
      <Modal
        visible={editingDay !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingDay(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setEditingDay(null)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingDay !== null ? WEEKDAY_LABEL[editingDay] : ''}
            </Text>

            <ScrollView style={styles.modalList}>
              <TouchableOpacity style={styles.modalOption} onPress={() => pick(null)}>
                <Feather name="moon" size={18} color={colors.text.secondary} />
                <Text style={styles.modalOptionLabel}>Descanso</Text>
              </TouchableOpacity>

              {workouts.map((w) => (
                <TouchableOpacity key={w.id} style={styles.modalOption} onPress={() => pick(w.id)}>
                  <Feather name="clipboard" size={18} color={colors.accent.default} />
                  <View style={styles.modalOptionText}>
                    <Text style={styles.modalOptionLabel} numberOfLines={1}>{w.name}</Text>
                    <Text style={styles.modalOptionMeta}>
                      {w.exercise_count} exercício{w.exercise_count === 1 ? '' : 's'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
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

  scroll: { padding: spacing['2xl'], gap: spacing.sm },
  intro: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.sm },
  muted: { ...typography.body, color: colors.text.secondary },
  link: { ...typography.label, color: colors.accent.default, marginTop: spacing.sm },

  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  dayRowToday: { borderColor: colors.accent.border },
  dayLabelWrapper: { width: 84, gap: 2 },
  dayLabel: { ...typography.subheading, color: colors.text.primary },
  dayLabelToday: { color: colors.accent.default },
  todayTag: { ...typography.labelSmall, color: colors.accent.default },

  dayValueWrapper: { flex: 1, gap: 2 },
  dayWorkout: { ...typography.body, color: colors.text.primary },
  dayMeta: { ...typography.bodySmall, color: colors.text.tertiary },
  dayRest: { ...typography.body, color: colors.text.tertiary },

  emptyBox: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing['3xl'] },

  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.bg.overlay,
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  modalCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.md,
    maxHeight: '70%',
  },
  modalTitle: { ...typography.h3, color: colors.text.primary },
  modalList: { flexGrow: 0 },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  modalOptionText: { flex: 1, gap: 2 },
  modalOptionLabel: { ...typography.subheading, color: colors.text.primary },
  modalOptionMeta: { ...typography.bodySmall, color: colors.text.tertiary },
});
