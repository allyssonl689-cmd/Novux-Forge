import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseHowToModal, RestTimerBar, SetRow, WorkoutTimer } from '@/components/workout';
import { Skeleton, SkeletonGroup, useConfirm } from '@/components/ui';
import { useAuth } from '@/features/auth/useAuth';
import {
  StartExerciseInput,
  useActiveWorkoutStore,
} from '@/features/workouts/activeWorkoutStore';
import { fetchLastPerformance } from '@/features/workouts/lastPerformanceService';
import { estimateOneRepMax, formatLastPerformance } from '@/features/workouts/progression';
import { useWorkouts } from '@/features/workouts/useWorkouts';
import {
  fetchWorkoutWithExercises,
  WorkoutExerciseDetailed,
  WorkoutSummary,
} from '@/features/workouts/workoutService';
import { useHaptics } from '@/hooks/useHaptics';
import { useElapsedSeconds, useRestTimer } from '@/hooks/useTimer';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

/** Converte os exercícios da ficha no formato que o store usa para montar as séries */
function toStartInput(
  exercises: WorkoutExerciseDetailed[],
  lastPerformance: Record<string, { weightKg: number; reps: number | null }>,
): StartExerciseInput[] {
  return exercises.map((ex, i) => ({
    exerciseId: ex.exercise_id,
    exerciseName: ex.exercise_name,
    sortOrder: ex.sort_order ?? i,
    defaultSets: ex.default_sets,
    defaultReps: ex.default_reps,
    defaultWeightKg: ex.default_weight_kg,
    restSeconds: ex.rest_seconds,
    notes: ex.notes,
    supersetGroup: ex.superset_group,
    lastPerformance: lastPerformance[ex.exercise_id] ?? null,
  }));
}

// ─── Tela de seleção de ficha ────────────────────────────────────────────────

function WorkoutPickerScreen({
  onPick,
  startingId,
}: {
  onPick: (w: WorkoutSummary) => void;
  startingId: string | null;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data: workouts = [], isLoading } = useWorkouts();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="x" size={22} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escolher ficha</Text>
        <View style={{ width: 38 }} />
      </View>

      {isLoading ? (
        <View style={styles.pickerList}>
          <SkeletonGroup gap={spacing.sm}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={64} radius={radius.lg} />
            ))}
          </SkeletonGroup>
        </View>
      ) : workouts.length === 0 ? (
        <View style={styles.center}>
          <Feather name="inbox" size={32} color={colors.text.tertiary} />
          <Text style={styles.muted}>Nenhuma ficha criada ainda</Text>
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => router.replace('/(app)/workouts')}
          >
            <Text style={styles.linkLabel}>Montar minha primeira ficha</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(w) => w.id}
          contentContainerStyle={styles.pickerList}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => {
            const empty = item.exercise_count === 0;
            return (
              <TouchableOpacity
                style={[styles.pickerCard, empty && styles.pickerCardDisabled]}
                onPress={() => onPick(item)}
                activeOpacity={0.75}
                disabled={startingId !== null}
              >
                <View style={styles.pickerCardLeft}>
                  <Text style={styles.pickerName}>{item.name}</Text>
                  <Text style={styles.pickerMeta}>
                    {item.category ? `${item.category} · ` : ''}
                    {item.exercise_count} exercício{item.exercise_count === 1 ? '' : 's'}
                  </Text>
                </View>
                {startingId === item.id ? (
                  <ActivityIndicator color={colors.accent.default} />
                ) : (
                  <Feather
                    name="play-circle"
                    size={24}
                    color={empty ? colors.text.tertiary : colors.accent.default}
                  />
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Tela de execução do treino ──────────────────────────────────────────────

function ActiveWorkoutScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const haptics = useHaptics();
  const confirm = useConfirm();
  const [finishing, setFinishing] = useState(false);
  const [howToId, setHowToId] = useState<string | null>(null);
  const {
    workoutName,
    startedAt,
    exercises,
    currentExerciseIndex,
    setCurrentExercise,
    updateSet,
    completeSet,
    uncompleteSet,
    addSet,
    removeSet,
    finishWorkout,
    discardWorkout,
  } = useActiveWorkoutStore();

  // O cronômetro deriva do início da sessão — reabrir o app não zera o tempo
  const seconds = useElapsedSeconds(startedAt);
  const rest = useRestTimer(() => haptics.heavy());

  const currentEx = exercises[currentExerciseIndex];
  const oneRepMax = currentEx?.lastPerformance
    ? estimateOneRepMax(currentEx.lastPerformance.weightKg, currentEx.lastPerformance.reps)
    : null;

  const completedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0,
  );
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  async function handleCompleteSet(setIdx: number) {
    haptics.success();
    const exerciseIdx = currentExerciseIndex;
    await completeSet(exerciseIdx, setIdx);

    const ex = exercises[exerciseIdx];

    // Superset: os dois exercícios do par não têm descanso entre si — vai
    // direto para o parceiro. O descanso da dupla só começa ao concluir uma
    // série do segundo exercício (o "âncora" do par) — inclusive a última,
    // para dar tempo de recuperar antes do próximo exercício.
    const partnerIdx =
      ex?.supersetGroup != null
        ? exercises.findIndex((e, i) => i !== exerciseIdx && e.supersetGroup === ex.supersetGroup)
        : -1;

    if (partnerIdx !== -1) {
      const isAnchor = exerciseIdx > partnerIdx;
      if (isAnchor && ex && ex.restSeconds > 0) {
        rest.start(ex.restSeconds);
      }
      setCurrentExercise(partnerIdx);
      return;
    }

    // Descanso automático a cada série concluída, inclusive a última — dá
    // tempo de recuperar antes de seguir para o próximo exercício.
    if (ex && ex.restSeconds > 0) {
      rest.start(ex.restSeconds);
    }
  }

  async function handleFinish() {
    if (completedSets === 0) {
      const action = await confirm({
        title: 'Nenhuma série concluída',
        message: 'Finalizar agora não vai registrar nada no histórico. Deseja descartar o treino?',
        actions: [
          { key: 'cancel', label: 'Continuar treinando', variant: 'secondary' },
          { key: 'discard', label: 'Descartar', variant: 'danger' },
        ],
      });
      if (action === 'discard') handleDiscardConfirmed();
      return;
    }

    const action = await confirm({
      title: 'Finalizar treino',
      message: `${completedSets} de ${totalSets} séries concluídas. Deseja finalizar?`,
      actions: [
        { key: 'cancel', label: 'Cancelar', variant: 'secondary' },
        { key: 'finish', label: 'Finalizar' },
      ],
    });
    if (action !== 'finish') return;

    rest.stop();
    setFinishing(true);
    try {
      await finishWorkout();
      haptics.heavy();
      router.replace('/(app)');
    } catch {
      setFinishing(false);
      haptics.error();
      confirm({
        title: 'Falha ao salvar',
        message: 'Sem conexão ou o Supabase não respondeu. Seus dados continuam aqui — toque em "Finalizar" de novo quando a conexão voltar.',
        actions: [{ key: 'ok', label: 'OK' }],
      });
    }
  }

  async function handleDiscardConfirmed() {
    rest.stop();
    await discardWorkout();
    router.replace('/(app)');
  }

  async function handleDiscard() {
    const action = await confirm({
      title: 'Descartar treino',
      message: 'Todo o progresso será perdido. Tem certeza?',
      actions: [
        { key: 'cancel', label: 'Cancelar', variant: 'secondary' },
        { key: 'discard', label: 'Descartar', variant: 'danger' },
      ],
    });
    if (action === 'discard') handleDiscardConfirmed();
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDiscard} style={styles.headerBtn}>
          <Feather name="x" size={22} color={colors.text.secondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{workoutName}</Text>
          <WorkoutTimer seconds={seconds} />
        </View>
        <TouchableOpacity style={styles.finishBtn} onPress={handleFinish} disabled={finishing}>
          {finishing ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <Text style={styles.finishLabel}>Finalizar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Progresso global */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` },
          ]}
        />
      </View>

      {/* Tabs de exercícios */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.exTabs}
        style={styles.exTabsScroll}
      >
        {exercises.map((ex, i) => {
          const done = ex.sets.every((s) => s.completed);
          const active = i === currentExerciseIndex;
          return (
            <TouchableOpacity
              key={ex.exerciseId}
              style={[styles.exTab, active && styles.exTabActive, done && styles.exTabDone]}
              onPress={() => setCurrentExercise(i)}
            >
              {ex.supersetGroup != null && (
                <Feather name="link" size={11} color={active ? colors.accent.default : colors.text.tertiary} />
              )}
              <Text style={[styles.exTabLabel, active && styles.exTabLabelActive]} numberOfLines={1}>
                {ex.exerciseName}
              </Text>
              {done && <Feather name="check" size={12} color={colors.accent.default} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Corpo — séries do exercício atual */}
      {currentEx && (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.exHeader}>
            <View style={styles.exNameRow}>
              <Text style={styles.exName}>{currentEx.exerciseName}</Text>
              <TouchableOpacity onPress={() => setHowToId(currentEx.exerciseId)} hitSlop={8}>
                <Feather name="info" size={18} color={colors.accent.default} />
              </TouchableOpacity>
            </View>
            <Text style={styles.exProgress}>
              {currentEx.sets.filter((s) => s.completed).length}/{currentEx.sets.length} séries
            </Text>
          </View>

          {currentEx.notes && <Text style={styles.exNotes}>{currentEx.notes}</Text>}

          {/* Última execução e sugestão de progressão */}
          {(currentEx.lastPerformance || currentEx.progressionApplied) && (
            <View style={styles.lastRow}>
              {currentEx.lastPerformance && (
                <View style={styles.lastChip}>
                  <Feather name="rotate-ccw" size={12} color={colors.text.secondary} />
                  <Text style={styles.lastLabel}>
                    Última vez: {formatLastPerformance(currentEx.lastPerformance)}
                  </Text>
                </View>
              )}
              {currentEx.progressionApplied && (
                <View style={styles.progressionChip}>
                  <Feather name="trending-up" size={12} color={colors.accent.default} />
                  <Text style={styles.progressionLabel}>Carga sugerida acima da última</Text>
                </View>
              )}
              {oneRepMax != null && (
                <View style={styles.lastChip}>
                  <Feather name="bar-chart-2" size={12} color={colors.text.secondary} />
                  <Text style={styles.lastLabel}>1RM est.: {oneRepMax} kg</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.tableHeader}>
            <Text style={[styles.tableCol, { width: 40 }]} numberOfLines={1}>Série</Text>
            <Text style={[styles.tableCol, { flex: 1 }]} numberOfLines={1}>Peso</Text>
            <Text style={[styles.tableCol, { flex: 1 }]} numberOfLines={1}>Reps</Text>
            <Text style={[styles.tableCol, { width: 40 }]} numberOfLines={1}>RPE</Text>
            <Text style={[styles.tableCol, { width: 80 }]}></Text>
          </View>

          <View style={styles.setsList}>
            {currentEx.sets.map((set, si) => (
              <SetRow
                key={set.id}
                set={set}
                onChangeWeight={(val) =>
                  updateSet(currentExerciseIndex, si, {
                    weightKg: val === '' ? null : parseFloat(val.replace(',', '.')) || null,
                  })
                }
                onChangeReps={(val) =>
                  updateSet(currentExerciseIndex, si, {
                    reps: val === '' ? null : parseInt(val, 10) || null,
                  })
                }
                onChangeRpe={(val) =>
                  updateSet(currentExerciseIndex, si, {
                    rpe: val === '' ? null : parseInt(val, 10) || null,
                  })
                }
                onComplete={() => handleCompleteSet(si)}
                onUncomplete={() => uncompleteSet(currentExerciseIndex, si)}
                onToggleWarmup={() =>
                  updateSet(currentExerciseIndex, si, { isWarmup: !set.isWarmup })
                }
                onRemove={() => removeSet(currentExerciseIndex, si)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.addSetBtn}
            onPress={() => { addSet(currentExerciseIndex); haptics.light(); }}
          >
            <Feather name="plus" size={16} color={colors.text.secondary} />
            <Text style={styles.addSetLabel}>Adicionar série</Text>
          </TouchableOpacity>

          <View style={styles.exNav}>
            {currentExerciseIndex > 0 && (
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => setCurrentExercise(currentExerciseIndex - 1)}
              >
                <Feather name="arrow-left" size={16} color={colors.text.secondary} />
                <Text style={styles.navLabel}>Anterior</Text>
              </TouchableOpacity>
            )}
            {currentExerciseIndex < exercises.length - 1 && (
              <TouchableOpacity
                style={[styles.navBtn, styles.navBtnNext]}
                onPress={() => setCurrentExercise(currentExerciseIndex + 1)}
              >
                <Text style={styles.navLabelNext}>Próximo</Text>
                <Feather name="arrow-right" size={16} color={colors.accent.default} />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      {rest.running && (
        <RestTimerBar
          secondsLeft={rest.secondsLeft}
          total={rest.total}
          onAdjust={rest.adjust}
          onSkip={rest.stop}
        />
      )}

      <ExerciseHowToModal exerciseId={howToId} onClose={() => setHowToId(null)} />
    </SafeAreaView>
  );
}

// ─── Orquestrador ────────────────────────────────────────────────────────────

export default function WorkoutActiveRoot() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();
  const confirm = useConfirm();
  const { workoutId: paramWorkoutId } = useLocalSearchParams<{ workoutId?: string }>();
  const {
    isActive,
    hasHydrated,
    workoutId: activeWorkoutId,
    startWorkout,
    discardWorkout,
  } = useActiveWorkoutStore();

  const [startingId, setStartingId] = useState<string | null>(null);
  const autoStartHandled = useRef(false);

  async function begin(workoutId: string, fallbackName: string) {
    if (!user) return;
    setStartingId(workoutId);
    try {
      const { workout, exercises } = await fetchWorkoutWithExercises(workoutId);

      if (exercises.length === 0) {
        const action = await confirm({
          title: 'Ficha sem exercícios',
          message: 'Adicione exercícios a esta ficha antes de treinar.',
          actions: [
            { key: 'cancel', label: 'Agora não', variant: 'secondary' },
            { key: 'edit', label: 'Editar ficha' },
          ],
        });
        if (action === 'edit') router.replace(`/(app)/workouts/${workoutId}`);
        return;
      }

      // Busca a última execução de cada exercício para mostrar referência e
      // sugerir a carga inicial. Falha aqui não impede treinar.
      const lastPerformance = await fetchLastPerformance(
        exercises.map((e) => e.exercise_id),
      );

      await startWorkout({
        workoutId,
        workoutName: workout?.name ?? fallbackName,
        exercises: toStartInput(exercises, lastPerformance),
        userId: user.id,
      });
    } catch {
      confirm({ title: 'Erro', message: 'Não foi possível iniciar o treino.', actions: [{ key: 'ok', label: 'OK' }] });
    } finally {
      setStartingId(null);
    }
  }

  // Início automático quando a tela recebe ?workoutId= (Home, lista de fichas, editor)
  useEffect(() => {
    if (!hasHydrated || !user || autoStartHandled.current) return;
    if (!paramWorkoutId) return;
    autoStartHandled.current = true;

    if (isActive) {
      // Já há sessão em andamento — o usuário decide o que fazer com ela
      if (activeWorkoutId === paramWorkoutId) return;
      (async () => {
        const action = await confirm({
          title: 'Treino em andamento',
          message: 'Você já tem um treino aberto. Deseja descartá-lo e começar este?',
          actions: [
            { key: 'cancel', label: 'Continuar o atual', variant: 'secondary' },
            { key: 'discard', label: 'Descartar e começar', variant: 'danger' },
          ],
        });
        if (action === 'discard') {
          await discardWorkout();
          begin(paramWorkoutId, '');
        }
      })();
      return;
    }

    begin(paramWorkoutId, '');
  }, [hasHydrated, user, paramWorkoutId, isActive, activeWorkoutId]);

  // Espera a sessão persistida ser restaurada antes de decidir a tela
  if (!hasHydrated) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent.default} />
        </View>
      </SafeAreaView>
    );
  }

  if (isActive) return <ActiveWorkoutScreen />;

  return (
    <WorkoutPickerScreen
      onPick={(w) => begin(w.id, w.name)}
      startingId={startingId}
    />
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

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
  headerBtn: { width: 38, alignItems: 'flex-start' },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerTitle: { ...typography.label, color: colors.text.secondary },
  finishBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.accent.default,
    minWidth: 78,
    alignItems: 'center',
  },
  finishLabel: { ...typography.label, color: colors.text.inverse },

  progressBar: { height: 3, backgroundColor: colors.bg.elevated },
  progressFill: { height: 3, backgroundColor: colors.accent.default, borderRadius: radius.full },

  // Tabs exercícios
  exTabsScroll: { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  exTabs: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  exTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
  },
  exTabActive: { backgroundColor: colors.accent.dim, borderWidth: 1, borderColor: colors.accent.border },
  exTabDone:   { opacity: 0.65 },
  exTabLabel:  { ...typography.bodySmall, color: colors.text.secondary, maxWidth: 100 },
  exTabLabelActive: { color: colors.accent.default },

  // Corpo
  body: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  exHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  exNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  exName:     { ...typography.h3, color: colors.text.primary, flexShrink: 1 },
  exProgress: { ...typography.bodySmall, color: colors.text.secondary },
  exNotes: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.md,
    padding: spacing.md,
  },

  lastRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  lastChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
  },
  lastLabel: { ...typography.bodySmall, color: colors.text.secondary },
  progressionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.accent.dim,
    borderWidth: 1,
    borderColor: colors.accent.border,
  },
  progressionLabel: { ...typography.labelSmall, color: colors.accent.default },

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tableCol: { ...typography.label, color: colors.text.tertiary, textAlign: 'center' },

  setsList: { gap: spacing.sm },

  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
  },
  addSetLabel: { ...typography.label, color: colors.text.secondary },

  exNav: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  navBtnNext: { marginLeft: 'auto', borderColor: colors.accent.border, backgroundColor: colors.accent.dim },
  navLabel:     { ...typography.label, color: colors.text.secondary },
  navLabelNext: { ...typography.label, color: colors.accent.default },

  // Picker
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  muted:  { ...typography.body, color: colors.text.secondary },
  linkBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  linkLabel: { ...typography.label, color: colors.accent.default },
  pickerList: { padding: spacing['2xl'] },
  pickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pickerCardDisabled: { opacity: 0.6 },
  pickerCardLeft: { flex: 1, gap: 4 },
  pickerName: { ...typography.subheading, color: colors.text.primary },
  pickerMeta: { ...typography.bodySmall, color: colors.text.secondary },
});
