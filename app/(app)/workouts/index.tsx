import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, EmptyState, Skeleton, SkeletonGroup, useConfirm } from '@/components/ui';
import { useCreateWorkout, useWorkouts } from '@/features/workouts/useWorkouts';
import { WorkoutSummary } from '@/features/workouts/workoutService';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

/** Sugestões de divisão — atalho para nomear a ficha sem digitar */
const CATEGORY_SUGGESTIONS = ['Push', 'Pull', 'Legs', 'Full Body', 'Upper', 'Lower', 'ABC'];

export default function WorkoutsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const haptics = useHaptics();
  const confirm = useConfirm();
  const { data: workouts = [], isLoading, refetch, isRefetching } = useWorkouts();
  const createWorkout = useCreateWorkout();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  function openModal() {
    setName('');
    setCategory(null);
    setModalOpen(true);
  }

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      const workout = await createWorkout.mutateAsync({ name: trimmed, category });
      haptics.success();
      setModalOpen(false);
      // Vai direto para o editor — ficha vazia não serve para nada
      router.push(`/(app)/workouts/${workout.id}`);
    } catch {
      haptics.error();
      confirm({ title: 'Erro', message: 'Não foi possível criar a ficha. Tente novamente.', actions: [{ key: 'ok', label: 'OK' }] });
    }
  }

  async function startWorkout(workout: WorkoutSummary) {
    if (workout.exercise_count === 0) {
      const action = await confirm({
        title: 'Ficha sem exercícios',
        message: 'Adicione pelo menos um exercício antes de treinar.',
        actions: [
          { key: 'cancel', label: 'Agora não', variant: 'secondary' },
          { key: 'edit', label: 'Editar ficha' },
        ],
      });
      if (action === 'edit') router.push(`/(app)/workouts/${workout.id}`);
      return;
    }
    router.push(`/(app)/workout/active?workoutId=${workout.id}`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Minhas fichas</Text>
          <Text style={styles.subtitle}>
            {workouts.length === 0
              ? 'Monte seu treino do jeito que quiser'
              : `${workouts.length} ficha${workouts.length > 1 ? 's' : ''} criada${workouts.length > 1 ? 's' : ''}`}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.scheduleBtn}
            onPress={() => router.push('/(app)/workouts/schedule')}
          >
            <Feather name="calendar" size={19} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={openModal}>
            <Feather name="plus" size={20} color={colors.text.inverse} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={workouts}
        keyExtractor={(w) => w.id}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isRefetching}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListHeaderComponent={
          workouts.length > 0 ? (
            <TouchableOpacity
              style={styles.plansBanner}
              onPress={() => router.push('/(app)/workouts/plans')}
              activeOpacity={0.8}
            >
              <View style={styles.plansIcon}>
                <Feather name="layers" size={18} color={colors.accent.default} />
              </View>
              <View style={styles.plansText}>
                <Text style={styles.plansTitle}>Planos prontos</Text>
                <Text style={styles.plansSubtitle}>
                  Divisões por grupo muscular montadas para o seu nível
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.center}>
              <SkeletonGroup gap={spacing.sm}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={64} radius={radius.lg} />
                ))}
              </SkeletonGroup>
            </View>
          ) : (
            <EmptyState
              icon="clipboard"
              title="Nenhuma ficha ainda"
              description={
                'Uma ficha é a lista de exercícios de um dia de treino — por exemplo ' +
                '"Peito e tríceps". Comece por um plano pronto: o app cria as fichas ' +
                'da divisão inteira e você ajusta o que quiser.'
              }
            >
              <Button label="Ver planos prontos" onPress={() => router.push('/(app)/workouts/plans')} />
              <Button label="Criar ficha do zero" variant="secondary" onPress={openModal} />
            </EmptyState>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(app)/workouts/${item.id}`)}
            activeOpacity={0.75}
          >
            <View style={styles.cardText}>
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardMeta}>
                {item.category ? `${item.category} · ` : ''}
                {item.exercise_count} exercício{item.exercise_count === 1 ? '' : 's'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={() => startWorkout(item)}
              hitSlop={8}
            >
              <Feather name="play" size={18} color={colors.accent.default} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Modal de criação */}
      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nova ficha</Text>

            <Input
              label="Nome"
              value={name}
              onChangeText={setName}
              placeholder="Ex.: Treino A — Peito e Tríceps"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />

            <View style={styles.suggestions}>
              <Text style={styles.suggestionsLabel}>Divisão (opcional)</Text>
              <View style={styles.suggestionChips}>
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chip, category === c && styles.chipActive]}
                    onPress={() => setCategory(category === c ? null : c)}
                  >
                    <Text style={[styles.chipLabel, category === c && styles.chipLabelActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                label="Cancelar"
                variant="secondary"
                onPress={() => setModalOpen(false)}
                style={styles.modalBtn}
              />
              <Button
                label="Criar"
                onPress={handleCreate}
                disabled={!name.trim()}
                loading={createWorkout.isPending}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
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
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: { ...typography.h2, color: colors.text.primary },
  subtitle: { ...typography.bodySmall, color: colors.text.secondary },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  scheduleBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.accent.default,
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: { paddingHorizontal: spacing['2xl'], paddingBottom: spacing['4xl'], flexGrow: 1 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
  },
  cardText: { flex: 1, gap: 2 },
  cardName: { ...typography.subheading, color: colors.text.primary },
  cardMeta: { ...typography.bodySmall, color: colors.text.secondary },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.accent.dim,
    borderWidth: 1,
    borderColor: colors.accent.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },

  plansBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.accent.dim,
    borderWidth: 1,
    borderColor: colors.accent.border,
  },
  plansIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.accent.glow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plansText: { flex: 1, gap: 2 },
  plansTitle: { ...typography.subheading, color: colors.text.primary },
  plansSubtitle: { ...typography.bodySmall, color: colors.text.secondary },

  // Modal
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
  suggestions: { gap: spacing.sm },
  suggestionsLabel: { ...typography.label, color: colors.text.secondary },
  suggestionChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
  },
  chipActive: { backgroundColor: colors.accent.dim, borderWidth: 1, borderColor: colors.accent.border },
  chipLabel: { ...typography.bodySmall, color: colors.text.secondary },
  chipLabelActive: { color: colors.accent.default },
  modalActions: { flexDirection: 'row', gap: spacing.sm },
  modalBtn: { flex: 1 },
});
