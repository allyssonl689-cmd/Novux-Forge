import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseHowToModal, ExercisePickerModal } from '@/components/workout';
import { Button, Input, Skeleton, SkeletonGroup, useConfirm } from '@/components/ui';
import {
  useAddExercisesToWorkout,
  useDeleteWorkout,
  useRemoveWorkoutExercise,
  useReorderWorkoutExercises,
  useUpdateWorkout,
  useUpdateWorkoutExercise,
  useWorkoutWithExercises,
} from '@/features/workouts/useWorkouts';
import { WorkoutExerciseDetailed } from '@/features/workouts/workoutService';
import { useHaptics } from '@/hooks/useHaptics';
import { useUnitStore } from '@/features/settings/unitStore';
import { toDisplayWeight, toKg } from '@/lib/units';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';
import { Exercise } from '@/types/workout';

export default function WorkoutEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workoutId = String(id);
  const router = useRouter();
  const haptics = useHaptics();
  const confirm = useConfirm();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data, isLoading } = useWorkoutWithExercises(workoutId);
  const addExercises = useAddExercisesToWorkout(workoutId);
  const updateExercise = useUpdateWorkoutExercise(workoutId);
  const removeExercise = useRemoveWorkoutExercise(workoutId);
  const reorder = useReorderWorkoutExercises(workoutId);
  const updateWorkout = useUpdateWorkout(workoutId);
  const deleteWorkout = useDeleteWorkout();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [howToId, setHowToId] = useState<string | null>(null);
  const [replacing, setReplacing] = useState<WorkoutExerciseDetailed | null>(null);

  const workout = data?.workout;
  const exercises = data?.exercises ?? [];

  function handleAdd(selected: Exercise[]) {
    addExercises.mutate(
      selected.map((e) => ({ exercise_id: e.id })),
      {
        onSuccess: () => haptics.success(),
        onError: () => confirm({ title: 'Erro', message: 'Não foi possível adicionar os exercícios.', actions: [{ key: 'ok', label: 'OK' }] }),
      },
    );
  }

  function handleReplace(selected: Exercise[]) {
    const target = replacing;
    const newExercise = selected[0];
    if (!target || !newExercise) return;
    updateExercise.mutate(
      { id: target.id, patch: { exercise_id: newExercise.id } },
      {
        onSuccess: () => haptics.success(),
        onError: () => confirm({ title: 'Erro', message: 'Não foi possível substituir o exercício.', actions: [{ key: 'ok', label: 'OK' }] }),
      },
    );
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= exercises.length) return;

    const next = [...exercises];
    [next[index], next[target]] = [next[target], next[index]];

    haptics.light();
    reorder.mutate(next.map((ex, i) => ({ id: ex.id, sort_order: i })));
  }

  /**
   * Superset: liga/desliga a dupla de exercícios adjacentes `index`/`index+1`.
   * Só suporta duplas (não cadeias de 3+) — cobre o caso de uso mais comum
   * e evita a complexidade de agrupar/desagrupar cadeias mais longas.
   */
  function handleToggleLink(index: number) {
    const a = exercises[index];
    const b = exercises[index + 1];
    if (!a || !b) return;

    haptics.light();
    const linked = a.superset_group != null && a.superset_group === b.superset_group;
    if (linked) {
      updateExercise.mutate({ id: a.id, patch: { superset_group: null } });
      updateExercise.mutate({ id: b.id, patch: { superset_group: null } });
    } else {
      const groupId = Date.now();
      updateExercise.mutate({ id: a.id, patch: { superset_group: groupId } });
      updateExercise.mutate({ id: b.id, patch: { superset_group: groupId } });
    }
  }

  async function handleRemove(ex: WorkoutExerciseDetailed) {
    const action = await confirm({
      title: 'Remover exercício',
      message: `Remover "${ex.exercise_name}" da ficha?`,
      actions: [
        { key: 'cancel', label: 'Cancelar', variant: 'secondary' },
        { key: 'remove', label: 'Remover', variant: 'danger' },
      ],
    });
    if (action === 'remove') removeExercise.mutate(ex.id);
  }

  function handleRename() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    updateWorkout.mutate(
      { name: trimmed },
      {
        onSuccess: () => setRenameOpen(false),
        onError: () => confirm({ title: 'Erro', message: 'Não foi possível renomear a ficha.', actions: [{ key: 'ok', label: 'OK' }] }),
      },
    );
  }

  async function handleDeleteWorkout() {
    const action = await confirm({
      title: 'Excluir ficha',
      message: 'A ficha será removida. Os treinos já realizados continuam no histórico.',
      actions: [
        { key: 'cancel', label: 'Cancelar', variant: 'secondary' },
        { key: 'delete', label: 'Excluir', variant: 'danger' },
      ],
    });
    if (action !== 'delete') return;
    deleteWorkout.mutate(workoutId, {
      onSuccess: () => router.back(),
      onError: () => confirm({ title: 'Erro', message: 'Não foi possível excluir a ficha.', actions: [{ key: 'ok', label: 'OK' }] }),
    });
  }

  function handleStart() {
    if (exercises.length === 0) {
      confirm({
        title: 'Ficha vazia',
        message: 'Adicione pelo menos um exercício antes de treinar.',
        actions: [{ key: 'ok', label: 'OK' }],
      });
      return;
    }
    router.push(`/(app)/workout/active?workoutId=${workoutId}`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {workout?.name ?? 'Ficha'}
          </Text>
          {workout?.category && <Text style={styles.headerMeta}>{workout.category}</Text>}
        </View>
        <TouchableOpacity
          onPress={() => {
            setNewName(workout?.name ?? '');
            setRenameOpen(true);
          }}
          style={styles.headerBtn}
          hitSlop={8}
        >
          <Feather name="edit-2" size={19} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {isLoading ? (
          <SkeletonGroup gap={spacing.md}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={72} radius={radius.lg} />
            ))}
          </SkeletonGroup>
        ) : exercises.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Feather name="plus-circle" size={26} color={colors.accent.default} />
            </View>
            <Text style={styles.emptyTitle}>Ficha vazia</Text>
            <Text style={styles.emptyText}>
              Adicione exercícios da biblioteca. Para cada um, você define quantas
              séries, quantas repetições e quanto tempo de descanso.
            </Text>
          </View>
        ) : (
          exercises.map((ex, i) => {
            const next = exercises[i + 1];
            const linkedWithNext =
              !!next && ex.superset_group != null && ex.superset_group === next.superset_group;
            const isSecondOfPair =
              i > 0 && ex.superset_group != null && ex.superset_group === exercises[i - 1].superset_group;
            return (
              <React.Fragment key={ex.id}>
                <ExerciseRow
                  index={i}
                  total={exercises.length}
                  exercise={ex}
                  isSuperset={isSecondOfPair || linkedWithNext}
                  onMove={(dir) => handleMove(i, dir)}
                  onRemove={() => handleRemove(ex)}
                  onPressInfo={() => setHowToId(ex.exercise_id)}
                  onReplace={() => setReplacing(ex)}
                  onPatch={(patch) => updateExercise.mutate({ id: ex.id, patch })}
                />
                {next && (
                  <TouchableOpacity
                    style={styles.linkConnector}
                    onPress={() => handleToggleLink(i)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.linkLine, linkedWithNext && styles.linkLineActive]} />
                    <View style={[styles.linkPill, linkedWithNext && styles.linkPillActive]}>
                      <Feather
                        name="link"
                        size={12}
                        color={linkedWithNext ? colors.accent.default : colors.text.tertiary}
                      />
                      <Text style={[styles.linkLabel, linkedWithNext && styles.linkLabelActive]}>
                        {linkedWithNext ? 'Superset' : 'Ligar como superset'}
                      </Text>
                    </View>
                    <View style={[styles.linkLine, linkedWithNext && styles.linkLineActive]} />
                  </TouchableOpacity>
                )}
              </React.Fragment>
            );
          })
        )}

        <TouchableOpacity style={styles.addExerciseBtn} onPress={() => setPickerOpen(true)}>
          <Feather name="plus" size={16} color={colors.accent.default} />
          <Text style={styles.addExerciseLabel}>Adicionar exercícios</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteWorkout}>
          <Feather name="trash-2" size={15} color={colors.feedback.danger} />
          <Text style={styles.deleteLabel}>Excluir ficha</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Rodapé fixo */}
      <View style={styles.footer}>
        <Button label="Iniciar treino" onPress={handleStart} disabled={exercises.length === 0} />
      </View>

      <ExercisePickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        alreadyAddedIds={exercises.map((e) => e.exercise_id)}
        onConfirm={handleAdd}
      />

      <ExercisePickerModal
        visible={!!replacing}
        onClose={() => setReplacing(null)}
        mode="single"
        title={`Substituir "${replacing?.exercise_name ?? ''}"`}
        alreadyAddedIds={exercises
          .filter((e) => e.id !== replacing?.id)
          .map((e) => e.exercise_id)}
        onConfirm={handleReplace}
      />

      <ExerciseHowToModal exerciseId={howToId} onClose={() => setHowToId(null)} />

      {/* Modal de renomear */}
      <Modal visible={renameOpen} transparent animationType="fade" onRequestClose={() => setRenameOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Renomear ficha</Text>
            <Input value={newName} onChangeText={setNewName} autoFocus onSubmitEditing={handleRename} />
            <View style={styles.modalActions}>
              <Button
                label="Cancelar"
                variant="secondary"
                onPress={() => setRenameOpen(false)}
                style={styles.modalBtn}
              />
              <Button
                label="Salvar"
                onPress={handleRename}
                disabled={!newName.trim()}
                loading={updateWorkout.isPending}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Linha de exercício com configuração inline ──────────────────────────────

interface RowProps {
  index: number;
  total: number;
  exercise: WorkoutExerciseDetailed;
  isSuperset: boolean;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onPressInfo: () => void;
  onReplace: () => void;
  onPatch: (patch: {
    default_sets?: number;
    default_reps?: number;
    default_weight_kg?: number | null;
    rest_seconds?: number;
  }) => void;
}

function ExerciseRow({ index, total, exercise, isSuperset, onMove, onRemove, onPressInfo, onReplace, onPatch }: RowProps) {
  const { colors } = useTheme();
  const rowStyles = useMemo(() => makeRowStyles(colors), [colors]);
  const unit = useUnitStore((s) => s.unit);
  const [sets, setSets] = useState(String(exercise.default_sets));
  const [reps, setReps] = useState(String(exercise.default_reps));
  const [weight, setWeight] = useState(() => {
    const display = toDisplayWeight(exercise.default_weight_kg, unit);
    return display !== null ? String(display) : '';
  });
  const [rest, setRest] = useState(String(exercise.rest_seconds));

  /** Só grava quando o valor realmente mudou e é válido */
  function commit(field: 'sets' | 'reps' | 'weight' | 'rest', raw: string) {
    if (field === 'weight') {
      const restoreWeight = () => {
        const display = toDisplayWeight(exercise.default_weight_kg, unit);
        setWeight(display !== null ? String(display) : '');
      };
      const typed = raw.trim() === '' ? null : parseFloat(raw.replace(',', '.'));
      if (typed !== null && (isNaN(typed) || typed < 0)) {
        restoreWeight();
        return;
      }
      const parsed = typed !== null ? toKg(typed, unit) : null;
      if (parsed !== exercise.default_weight_kg) onPatch({ default_weight_kg: parsed });
      return;
    }

    const parsed = parseInt(raw, 10);
    const current = {
      sets: exercise.default_sets,
      reps: exercise.default_reps,
      rest: exercise.rest_seconds,
    }[field];

    if (isNaN(parsed) || parsed < (field === 'rest' ? 0 : 1)) {
      // valor inválido volta ao que está salvo
      const restore = { sets: setSets, reps: setReps, rest: setRest }[field];
      restore(String(current));
      return;
    }
    if (parsed === current) return;

    if (field === 'sets') onPatch({ default_sets: parsed });
    if (field === 'reps') onPatch({ default_reps: parsed });
    if (field === 'rest') onPatch({ rest_seconds: parsed });
  }

  return (
    <View style={rowStyles.card}>
      <View style={rowStyles.top}>
        <View style={rowStyles.orderBadge}>
          <Text style={rowStyles.orderText}>{index + 1}</Text>
        </View>
        <View style={rowStyles.nameWrapper}>
          <View style={rowStyles.nameRow}>
            <Text style={rowStyles.name} numberOfLines={2}>{exercise.exercise_name}</Text>
            {isSuperset && (
              <View style={rowStyles.supersetBadge}>
                <Feather name="link" size={10} color={colors.accent.default} />
              </View>
            )}
          </View>
          <Text style={rowStyles.meta}>
            {exercise.muscle_group} · {exercise.equipment}
          </Text>
        </View>
        <View style={rowStyles.actions}>
          <TouchableOpacity onPress={onPressInfo} hitSlop={6}>
            <Feather name="info" size={17} color={colors.accent.default} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onReplace} hitSlop={6}>
            <Feather name="repeat" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onMove(-1)} disabled={index === 0} hitSlop={6}>
            <Feather
              name="chevron-up"
              size={18}
              color={index === 0 ? colors.text.tertiary : colors.text.secondary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onMove(1)} disabled={index === total - 1} hitSlop={6}>
            <Feather
              name="chevron-down"
              size={18}
              color={index === total - 1 ? colors.text.tertiary : colors.text.secondary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onRemove} hitSlop={6}>
            <Feather name="trash-2" size={16} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={rowStyles.fields}>
        <Field
          label="Séries"
          value={sets}
          onChangeText={setSets}
          onEndEditing={() => commit('sets', sets)}
        />
        <Field
          label="Reps"
          value={reps}
          onChangeText={setReps}
          onEndEditing={() => commit('reps', reps)}
        />
        <Field
          label={`Carga (${unit})`}
          value={weight}
          placeholder="—"
          decimal
          onChangeText={setWeight}
          onEndEditing={() => commit('weight', weight)}
        />
        <Field
          label="Desc. (s)"
          value={rest}
          onChangeText={setRest}
          onEndEditing={() => commit('rest', rest)}
        />
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  onEndEditing,
  placeholder,
  decimal,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onEndEditing: () => void;
  placeholder?: string;
  decimal?: boolean;
}) {
  const { colors } = useTheme();
  const rowStyles = useMemo(() => makeRowStyles(colors), [colors]);
  return (
    <View style={rowStyles.field}>
      <Text style={rowStyles.fieldLabel}>{label}</Text>
      <TextInput
        style={rowStyles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        onEndEditing={onEndEditing}
        onBlur={onEndEditing}
        keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        selectTextOnFocus
      />
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

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
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerTitle: { ...typography.subheading, color: colors.text.primary },
  headerMeta: { ...typography.labelSmall, color: colors.text.secondary },

  scroll: {
    padding: spacing['2xl'],
    paddingBottom: spacing['3xl'],
    gap: spacing.sm,
  },

  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing['3xl'] },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.accent.dim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...typography.h3, color: colors.text.primary },
  emptyText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },

  linkConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing['3xl'],
  },
  linkLine: { flex: 1, height: 1, backgroundColor: colors.border.default },
  linkLineActive: { backgroundColor: colors.accent.border },
  linkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  linkPillActive: { backgroundColor: colors.accent.dim, borderColor: colors.accent.border },
  linkLabel: { ...typography.labelSmall, color: colors.text.tertiary },
  linkLabelActive: { color: colors.accent.default },

  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accent.border,
    marginTop: spacing.sm,
  },
  addExerciseLabel: { ...typography.label, color: colors.accent.default },

  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
  },
  deleteLabel: { ...typography.label, color: colors.feedback.danger },

  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    backgroundColor: colors.bg.surface,
  },

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
    padding: spacing['2xl'],
    gap: spacing.lg,
  },
  modalTitle: { ...typography.h3, color: colors.text.primary },
  modalActions: { flexDirection: 'row', gap: spacing.sm },
  modalBtn: { flex: 1 },
});

const makeRowStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.md,
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  orderBadge: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: { ...typography.labelSmall, color: colors.text.secondary },
  nameWrapper: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  supersetBadge: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.accent.dim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { ...typography.subheading, color: colors.text.primary, flexShrink: 1 },
  meta: { ...typography.bodySmall, color: colors.text.secondary },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },

  fields: { flexDirection: 'row', gap: spacing.sm },
  field: { flex: 1, gap: spacing.xs },
  fieldLabel: { ...typography.labelSmall, color: colors.text.tertiary },
  fieldInput: {
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...typography.subheading,
    color: colors.text.primary,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
  },
});
