import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Skeleton, SkeletonGroup } from '@/components/ui';
import { useExercises } from '@/features/exercises/useExercises';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';
import { Exercise } from '@/types/workout';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Ids já presentes na ficha — aparecem marcados e desabilitados */
  alreadyAddedIds?: string[];
  onConfirm: (exercises: Exercise[]) => void;
}

const ALL = 'Todos';

export function ExercisePickerModal({ visible, onClose, alreadyAddedIds = [], onConfirm }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data: exercises = [], isLoading } = useExercises();
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<string>(ALL);
  const [selected, setSelected] = useState<Record<string, Exercise>>({});

  const groups = useMemo(() => {
    const unique = Array.from(new Set(exercises.map((e) => e.muscle_group))).sort();
    return [ALL, ...unique];
  }, [exercises]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return exercises.filter((e) => {
      const matchesGroup = group === ALL || e.muscle_group === group;
      const matchesTerm =
        !term ||
        e.name.toLowerCase().includes(term) ||
        e.muscle_group.toLowerCase().includes(term) ||
        e.equipment.toLowerCase().includes(term);
      return matchesGroup && matchesTerm;
    });
  }, [exercises, search, group]);

  const selectedList = Object.values(selected);

  function toggle(exercise: Exercise) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[exercise.id]) delete next[exercise.id];
      else next[exercise.id] = exercise;
      return next;
    });
  }

  function handleClose() {
    setSelected({});
    setSearch('');
    setGroup(ALL);
    onClose();
  }

  function handleConfirm() {
    onConfirm(selectedList);
    handleClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerBtn} hitSlop={8}>
            <Feather name="x" size={22} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Adicionar exercícios</Text>
          <View style={styles.headerBtn} />
        </View>

        {/* Busca */}
        <View style={styles.searchWrapper}>
          <Feather name="search" size={16} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nome, grupo ou equipamento"
            placeholderTextColor={colors.text.tertiary}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <Feather name="x-circle" size={16} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtro por grupo muscular */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chips}
        >
          {groups.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.chip, group === g && styles.chipActive]}
              onPress={() => setGroup(g)}
            >
              <Text style={[styles.chipLabel, group === g && styles.chipLabelActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading ? (
          <View style={styles.listPadding}>
            <SkeletonGroup gap={spacing.md}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={styles.rowSkeleton}>
                  <Skeleton width={40} height={40} radius={radius.md} />
                  <View style={{ flex: 1, gap: spacing.xs }}>
                    <Skeleton width="60%" height={14} />
                    <Skeleton width="35%" height={11} />
                  </View>
                </View>
              ))}
            </SkeletonGroup>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(e) => e.id}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            ListEmptyComponent={
              <View style={styles.center}>
                <Feather name="search" size={28} color={colors.text.tertiary} />
                <Text style={styles.muted}>Nenhum exercício encontrado</Text>
              </View>
            }
            renderItem={({ item }) => {
              const added = alreadyAddedIds.includes(item.id);
              const isSelected = !!selected[item.id];
              return (
                <TouchableOpacity
                  style={[styles.row, isSelected && styles.rowSelected, added && styles.rowAdded]}
                  onPress={() => !added && toggle(item)}
                  activeOpacity={added ? 1 : 0.75}
                >
                  <View style={styles.rowText}>
                    <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.rowMeta}>
                      {item.muscle_group} · {item.equipment}
                    </Text>
                  </View>
                  {added ? (
                    <Text style={styles.addedLabel}>na ficha</Text>
                  ) : (
                    <View style={[styles.checkbox, isSelected && styles.checkboxOn]}>
                      {isSelected && <Feather name="check" size={14} color={colors.text.inverse} />}
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}

        {selectedList.length > 0 && (
          <View style={styles.footer}>
            <Button
              label={`Adicionar ${selectedList.length} exercício${selectedList.length > 1 ? 's' : ''}`}
              onPress={handleConfirm}
            />
          </View>
        )}
      </SafeAreaView>
    </Modal>
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
  headerBtn: { width: 32 },
  headerTitle: { ...typography.subheading, color: colors.text.primary },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.text.primary },

  chipsScroll: { maxHeight: 52, marginTop: spacing.md },
  chips: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
  },
  chipActive: { backgroundColor: colors.accent.dim, borderWidth: 1, borderColor: colors.accent.border },
  chipLabel: { ...typography.bodySmall, color: colors.text.secondary },
  chipLabelActive: { color: colors.accent.default },

  list: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  rowSelected: { borderColor: colors.accent.border, backgroundColor: colors.accent.dim },
  rowAdded: { opacity: 0.45 },
  rowText: { flex: 1, gap: 2 },
  rowName: { ...typography.subheading, color: colors.text.primary },
  rowMeta: { ...typography.bodySmall, color: colors.text.secondary },
  addedLabel: { ...typography.labelSmall, color: colors.text.tertiary },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.accent.default, borderColor: colors.accent.default },

  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    backgroundColor: colors.bg.surface,
  },

  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingVertical: spacing['5xl'] },
  listPadding: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  rowSkeleton: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  muted: { ...typography.body, color: colors.text.secondary },
});
