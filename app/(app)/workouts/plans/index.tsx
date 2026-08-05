import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
import { useSplits } from '@/features/splits/useSplits';
import {
  EQUIPMENT_LABEL,
  GOAL_LABEL,
  LEVEL_LABEL,
  SplitLevel,
  TrainingSplit,
} from '@/features/splits/splitService';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

const LEVEL_FILTERS: { key: SplitLevel | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'beginner', label: 'Iniciante' },
  { key: 'intermediate', label: 'Intermediário' },
  { key: 'advanced', label: 'Avançado' },
];

export default function PlansScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data: splits = [], isLoading } = useSplits();
  const [level, setLevel] = useState<SplitLevel | 'all'>('all');

  const filtered = useMemo(
    () => (level === 'all' ? splits : splits.filter((s) => s.level === level)),
    [splits, level],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Planos prontos</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chips}
      >
        {LEVEL_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, level === f.key && styles.chipActive]}
            onPress={() => setLevel(f.key)}
          >
            <Text style={[styles.chipLabel, level === f.key && styles.chipLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent.default} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListHeaderComponent={
            <Text style={styles.intro}>
              Combinações de grupos musculares por dia, montadas por nível e por
              quantos dias você consegue treinar. Escolha uma e o app cria as
              fichas para você — dá para editar tudo depois.
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.muted}>Nenhum plano para este nível</Text>
            </View>
          }
          renderItem={({ item }) => <PlanCard split={item} onPress={() => router.push(`/(app)/workouts/plans/${item.id}`)} />}
        />
      )}
    </SafeAreaView>
  );
}

function PlanCard({ split, onPress }: { split: TrainingSplit; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isBeginner = split.level === 'beginner';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrapper}>
          <Text style={styles.cardName}>{split.name}</Text>
          {split.subtitle && <Text style={styles.cardSubtitle}>{split.subtitle}</Text>}
        </View>
        <View style={styles.daysBadge}>
          <Text style={styles.daysNumber}>{split.days_per_week}</Text>
          <Text style={styles.daysLabel}>dias</Text>
        </View>
      </View>

      <View style={styles.tags}>
        <Tag label={LEVEL_LABEL[split.level]} highlight={isBeginner} />
        <Tag label={GOAL_LABEL[split.goal]} />
        <Tag label={EQUIPMENT_LABEL[split.equipment_profile]} />
      </View>
    </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerBtn: { width: 38, alignItems: 'center' },
  headerTitle: { ...typography.subheading, color: colors.text.primary },

  chipsScroll: { maxHeight: 56, marginTop: spacing.md },
  chips: { paddingHorizontal: spacing['2xl'], gap: spacing.sm, alignItems: 'center' },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
  },
  chipActive: { backgroundColor: colors.accent.dim, borderWidth: 1, borderColor: colors.accent.border },
  chipLabel: { ...typography.bodySmall, color: colors.text.secondary },
  chipLabelActive: { color: colors.accent.default },

  list: { padding: spacing['2xl'], paddingBottom: spacing['4xl'] },
  intro: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },

  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  cardTitleWrapper: { flex: 1, gap: 4 },
  cardName: { ...typography.h3, color: colors.text.primary },
  cardSubtitle: { ...typography.bodySmall, color: colors.text.secondary },

  daysBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.accent.dim,
    borderWidth: 1,
    borderColor: colors.accent.border,
  },
  daysNumber: { ...typography.h3, color: colors.accent.default },
  daysLabel: { ...typography.labelSmall, color: colors.accent.default },

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

  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['5xl'], gap: spacing.md },
  muted: { ...typography.body, color: colors.text.secondary },
});
