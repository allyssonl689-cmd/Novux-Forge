import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseCard } from '@/components/workout';
import { Skeleton, SkeletonGroup } from '@/components/ui';
import { useExercises } from '@/features/exercises/useExercises';
import { Exercise } from '@/types/workout';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

const ALL = 'Todos';

export default function ExercisesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data: exercises = [], isLoading, isError, refetch } = useExercises();
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState(ALL);

  // Grupos musculares únicos extraídos dos dados reais
  const muscleGroups = useMemo(() => {
    const groups: string[] = Array.from(new Set<string>(exercises.map((e: Exercise) => e.muscle_group))).sort();
    return [ALL, ...groups] as string[];
  }, [exercises]);

  // Filtragem combinada: busca textual + grupo muscular
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return exercises.filter((e: Exercise) => {
      const matchGroup = activeGroup === ALL || e.muscle_group === activeGroup;
      const matchSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.muscle_group.toLowerCase().includes(q) ||
        e.equipment.toLowerCase().includes(q);
      return matchGroup && matchSearch;
    });
  }, [exercises, search, activeGroup]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Exercícios</Text>
          <Text style={styles.count}>
            {isLoading ? '—' : `${filtered.length} encontrados`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.glossaryBtn}
          onPress={() => router.push('/(app)/exercises/glossary')}
        >
          <Feather name="help-circle" size={19} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Barra de busca */}
      <View style={styles.searchWrapper}>
        <Feather name="search" size={16} color={colors.text.tertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar exercício..."
          placeholderTextColor={colors.text.tertiary}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={16} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtro de grupo muscular */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        style={styles.filtersScroll}
      >
        {muscleGroups.map((group) => {
          const active = group === activeGroup;
          return (
            <TouchableOpacity
              key={group}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setActiveGroup(group)}
              activeOpacity={0.75}
            >
              <Text
                style={[styles.filterLabel, active && styles.filterLabelActive]}
                numberOfLines={1}
              >
                {group}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Lista */}
      {isLoading ? (
        <View style={styles.listSkeleton}>
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
      ) : isError ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={32} color={colors.text.tertiary} />
          <Text style={styles.errorText}>Erro ao carregar exercícios</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryLabel}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList<Exercise>
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <Feather name="inbox" size={32} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>Nenhum exercício encontrado</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <ExerciseCard
              exercise={item}
              onPress={() => router.push(`/(app)/exercises/${item.id}`)}
            />
          )}
        />
      )}
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
    paddingBottom: spacing.sm,
  },
  headerText: { gap: 2 },
  title: { ...typography.h2, color: colors.text.primary },
  count: { ...typography.bodySmall, color: colors.text.tertiary },
  glossaryBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Busca
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing['2xl'],
    marginBottom: spacing.sm,
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.lg,
    height: 48,
    gap: spacing.sm,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
  },

  // Filtros
  filtersScroll: { maxHeight: 56, marginBottom: spacing.sm },
  filtersRow: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xs,
    gap: spacing.sm,
    alignItems: 'center',
  },
  filterChip: {
    flexShrink: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  filterChipActive: {
    backgroundColor: colors.accent.dim,
    borderColor: colors.accent.border,
  },
  filterLabel: { ...typography.label, lineHeight: 18, color: colors.text.secondary },
  filterLabelActive: { color: colors.accent.default },

  // Lista
  list: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    paddingTop: spacing.sm,
  },
  separator: { height: spacing.sm },

  // Estados vazios/erro/loading
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing['4xl'],
  },
  listSkeleton: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  rowSkeleton: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  errorText:   { ...typography.body, color: colors.text.secondary },
  emptyText:   { ...typography.body, color: colors.text.secondary },
  retryBtn: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  retryLabel: { ...typography.label, color: colors.text.primary },
});
