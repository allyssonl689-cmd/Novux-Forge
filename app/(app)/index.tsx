import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { StatCard } from '@/components/workout';
import { useAuth } from '@/features/auth/useAuth';
import { useHistory } from '@/features/history/useHistory';
import { WorkoutLogSummary } from '@/features/history/historyService';
import { WEEKDAY_SHORT } from '@/features/plan/recommendation';
import { useOnboardingProfile, useWeeklyPlan } from '@/features/plan/useWeeklyPlan';
import { scoreColor } from '@/components/stats/ScoreRing';
import { useTrainingStats } from '@/features/stats/useStats';
import { useActiveWorkoutStore } from '@/features/workouts/activeWorkoutStore';
import { useUnitStore } from '@/features/settings/unitStore';
import { formatVolume } from '@/lib/units';
import { useWorkouts } from '@/features/workouts/useWorkouts';
import { WorkoutSummary } from '@/features/workouts/workoutService';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { fonts, radius, spacing, typography } from '@/theme';

function greeting(name: string | null | undefined): string {
  const hour = new Date().getHours();
  const base = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  return name ? `${base}, ${name.split(' ')[0]}` : base;
}

/** Estimativa grosseira: cada série leva ~3,5 min entre execução e descanso */
function estimateMinutes(exerciseCount: number): number {
  return Math.max(10, Math.round(exerciseCount * 3 * 3.5));
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors, gradient, mode, toggle } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name as string | undefined;

  const { data: history = [] } = useHistory();
  const { data: workouts = [] } = useWorkouts();
  const { data: weeklyPlan = [] } = useWeeklyPlan();
  const { data: profile, isLoading: profileLoading } = useOnboardingProfile();
  const { data: stats } = useTrainingStats();
  const { isActive, workoutName: activeName } = useActiveWorkoutStore();
  const unit = useUnitStore((s) => s.unit);

  const todayWeekday = new Date().getDay();
  const todayEntry = weeklyPlan.find((e) => e.weekday === todayWeekday);

  // Stats da semana atual com dados reais
  const weekStats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // domingo
    weekStart.setHours(0, 0, 0, 0);

    const thisWeek = history.filter(
      (log: WorkoutLogSummary) => log.finished_at && new Date(log.started_at) >= weekStart,
    );

    const totalVolume = thisWeek.reduce((acc: number, l: WorkoutLogSummary) => acc + (l.total_volume_kg ?? 0), 0);
    const totalSecs = thisWeek.reduce((acc: number, l: WorkoutLogSummary) => acc + (l.duration_secs ?? 0), 0);
    const volume = formatVolume(totalVolume, unit);

    return {
      workouts: String(thisWeek.length),
      volumeValue: volume.value,
      volumeUnit: volume.unitLabel,
      timeMin: String(Math.round(totalSecs / 60)),
    };
  }, [history, unit]);

  /**
   * Sem agenda semanal, cai na rotação: a ficha treinada há mais tempo
   * (fichas nunca feitas vêm primeiro).
   */
  const fallbackWorkout = useMemo<WorkoutSummary | null>(() => {
    if (workouts.length === 0) return null;

    const lastDone = new Map<string, number>();
    for (const log of history) {
      if (!log.workout_id) continue;
      const t = new Date(log.started_at).getTime();
      if (t > (lastDone.get(log.workout_id) ?? 0)) lastDone.set(log.workout_id, t);
    }

    return [...workouts].sort(
      (a, b) => (lastDone.get(a.id) ?? 0) - (lastDone.get(b.id) ?? 0),
    )[0];
  }, [workouts, history]);

  // Primeiro acesso: manda para o wizard antes de mostrar uma Home vazia
  if (!profileLoading && profile && !profile.onboarding_completed_at && workouts.length === 0) {
    return <Redirect href="/(app)/onboarding" />;
  }

  const hasSchedule = weeklyPlan.length > 0;
  const isRestDay = hasSchedule && !todayEntry;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greet}>{greeting(displayName)}</Text>
            <Text style={styles.subgreet}>
              {isRestDay ? 'Hoje é dia de descanso' : 'Pronto para treinar?'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.avatarBtn} onPress={toggle}>
              <Feather name={mode === 'dark' ? 'sun' : 'moon'} size={19} color={colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/(app)/profile')}>
              <Feather name="user" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sessão em andamento */}
        {isActive && (
          <TouchableOpacity
            style={styles.resumeCard}
            onPress={() => router.push('/(app)/workout/active')}
            activeOpacity={0.8}
          >
            <View style={styles.resumeIcon}>
              <Feather name="activity" size={18} color={colors.amber.default} />
            </View>
            <View style={styles.resumeText}>
              <Text style={styles.resumeLabel}>Treino em andamento</Text>
              <Text style={styles.resumeName} numberOfLines={1}>{activeName}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.amber.default} />
          </TouchableOpacity>
        )}

        {/* Faixa da semana */}
        {hasSchedule && (
          <TouchableOpacity
            style={styles.weekStrip}
            onPress={() => router.push('/(app)/workouts/schedule')}
            activeOpacity={0.8}
          >
            {WEEKDAY_SHORT.map((label, i) => {
              const entry = weeklyPlan.find((e) => e.weekday === i);
              const isToday = i === todayWeekday;
              return (
                <View
                  key={label}
                  style={[
                    styles.weekDay,
                    entry && styles.weekDayScheduled,
                    isToday && styles.weekDayToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.weekDayLabel,
                      entry && styles.weekDayLabelScheduled,
                      isToday && styles.weekDayLabelToday,
                    ]}
                  >
                    {label}
                  </Text>
                  <View style={[styles.weekDot, entry && styles.weekDotOn]} />
                </View>
              );
            })}
          </TouchableOpacity>
        )}

        {/* Resumo da semana */}
        <Text style={styles.sectionLabel}>Esta semana</Text>
        <View style={styles.statsRow}>
          <StatCard label="Treinos" value={weekStats.workouts} accent />
          <StatCard label="Volume" value={weekStats.volumeValue} unit={weekStats.volumeUnit} />
          <StatCard label="Tempo" value={weekStats.timeMin} unit="min" />
        </View>

        {/* Score de treino */}
        {stats?.hasData && (
          <TouchableOpacity
            style={styles.scoreCard}
            onPress={() => router.push('/(app)/progress')}
            activeOpacity={0.8}
          >
            <View style={styles.scoreLeft}>
              <Text style={styles.scoreLabel}>Score de treino</Text>
              <View style={styles.scoreValueRow}>
                <Text style={[styles.scoreValue, { color: scoreColor(colors, stats.score.label) }]}>
                  {stats.score.score}
                </Text>
                <Text style={styles.scoreMax}>/ 1000 · {stats.score.label}</Text>
              </View>
            </View>
            <Feather name="bar-chart-2" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}

        {/* Card principal */}
        <Text style={styles.sectionLabel}>
          {todayEntry ? 'Treino de hoje' : isRestDay ? 'Descanso' : 'Próximo treino'}
        </Text>
        <View style={styles.nextCard}>
          <BlurView intensity={18} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.nextBlur}>
            <View style={styles.nextInner}>
              <View style={styles.nextTop}>
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.nextIconWrapper}
                >
                  <Feather
                    name={isRestDay ? 'moon' : 'zap'}
                    size={18}
                    color={colors.accent.on}
                  />
                </LinearGradient>
                <View style={styles.nextMeta}>
                  <Text style={styles.nextExCount}>{metaLine()}</Text>
                </View>
              </View>

              <Text style={styles.nextName}>{titleLine()}</Text>

              {actionButton()}
            </View>
          </BlurView>
        </View>

        {/* Atalhos rápidos */}
        <Text style={styles.sectionLabel}>Atalhos</Text>
        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            style={styles.shortcut}
            onPress={() => router.push('/(app)/workouts')}
          >
            <Feather name="clipboard" size={20} color={colors.accent.default} />
            <Text style={styles.shortcutLabel}>Fichas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcut}
            onPress={() => router.push('/(app)/exercises')}
          >
            <Feather name="book-open" size={20} color={colors.text.secondary} />
            <Text style={styles.shortcutLabel}>Exercícios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcut}
            onPress={() => router.push('/(app)/history')}
          >
            <Feather name="clock" size={20} color={colors.text.secondary} />
            <Text style={styles.shortcutLabel}>Histórico</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // ── Conteúdo do card principal, conforme o estado do dia ──

  function metaLine(): string {
    if (todayEntry) {
      return `${todayEntry.exercise_count} exercício${todayEntry.exercise_count === 1 ? '' : 's'} · ~${estimateMinutes(todayEntry.exercise_count)} min`;
    }
    if (isRestDay) {
      const next = nextScheduled();
      return next
        ? `Próximo treino: ${WEEKDAY_SHORT[next.weekday]}`
        : 'Aproveite para descansar';
    }
    if (fallbackWorkout) {
      return `${fallbackWorkout.exercise_count} exercício${fallbackWorkout.exercise_count === 1 ? '' : 's'} · ~${estimateMinutes(fallbackWorkout.exercise_count)} min`;
    }
    return 'Escolha um plano pronto e comece hoje';
  }

  function titleLine(): string {
    if (todayEntry) return todayEntry.workout_name;
    if (isRestDay) {
      const next = nextScheduled();
      return next ? next.workout_name : 'Dia de descanso';
    }
    if (fallbackWorkout) return fallbackWorkout.name;
    return 'Nenhuma ficha criada';
  }

  function actionButton() {
    if (todayEntry) {
      return (
        <Button
          label="Iniciar treino"
          onPress={() => router.push(`/(app)/workout/active?workoutId=${todayEntry.workout_id}`)}
          style={styles.startBtn}
        />
      );
    }

    if (isRestDay) {
      const next = nextScheduled();
      return (
        <Button
          label="Treinar mesmo assim"
          variant="secondary"
          onPress={() =>
            router.push(
              next
                ? `/(app)/workout/active?workoutId=${next.workout_id}`
                : '/(app)/workout/active',
            )
          }
          style={styles.startBtn}
        />
      );
    }

    if (fallbackWorkout) {
      return (
        <Button
          label="Iniciar treino"
          onPress={() => router.push(`/(app)/workout/active?workoutId=${fallbackWorkout.id}`)}
          style={styles.startBtn}
        />
      );
    }

    return (
      <Button
        label="Ver planos prontos"
        onPress={() => router.push('/(app)/workouts/plans')}
        style={styles.startBtn}
      />
    );
  }

  /** Próximo dia agendado a partir de hoje, dando a volta na semana */
  function nextScheduled() {
    for (let i = 1; i <= 7; i++) {
      const wd = (todayWeekday + i) % 7;
      const entry = weeklyPlan.find((e) => e.weekday === wd);
      if (entry) return entry;
    }
    return null;
  }
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.md,
  },

  // Cabeçalho
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerText: { gap: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  greet: { ...typography.h2, color: colors.text.primary },
  subgreet: { ...typography.body, color: colors.text.secondary },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Treino em andamento
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.amber.dim,
    borderWidth: 1,
    borderColor: colors.amber.border,
  },
  resumeIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: 'rgba(245,200,66,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeText: { flex: 1, gap: 2 },
  resumeLabel: { ...typography.labelSmall, color: colors.amber.default },
  resumeName: { ...typography.subheading, color: colors.text.primary },

  // Faixa da semana
  weekStrip: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  weekDayScheduled: { backgroundColor: colors.bg.elevated },
  weekDayToday: { borderColor: colors.accent.border },
  weekDayLabel: { ...typography.labelSmall, color: colors.text.tertiary },
  weekDayLabelScheduled: { color: colors.text.secondary },
  weekDayLabelToday: { color: colors.accent.default },
  weekDot: {
    width: 4,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: 'transparent',
  },
  weekDotOn: { backgroundColor: colors.accent.default },

  // Labels de seção
  sectionLabel: {
    ...typography.label,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    height: 96,
  },

  // Score
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginTop: spacing.md,
  },
  scoreLeft: { gap: 2 },
  scoreLabel: { ...typography.label, color: colors.text.secondary },
  scoreValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  scoreValue: { fontFamily: fonts.numBold, fontSize: 26 },
  scoreMax: { ...typography.bodySmall, color: colors.text.tertiary },

  // Card principal
  nextCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.accent.border,
  },
  nextBlur: { flex: 1 },
  nextInner: {
    padding: spacing['2xl'],
    backgroundColor: colors.accent.dim,
    gap: spacing.md,
  },
  nextTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nextIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.accent.glow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextMeta: { flex: 1 },
  nextExCount: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  nextName: {
    ...typography.h3,
    color: colors.text.primary,
  },
  startBtn: { marginTop: spacing.xs },

  // Atalhos
  shortcutsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  shortcut: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  shortcutLabel: {
    ...typography.label,
    color: colors.text.secondary,
  },
});
