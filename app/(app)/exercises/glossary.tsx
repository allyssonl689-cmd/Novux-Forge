import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GLOSSARY, GlossaryTerm } from '@/features/glossary/terms';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

export default function GlossaryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return GLOSSARY;
    return GLOSSARY.filter(
      (t) =>
        t.term.toLowerCase().includes(term) ||
        t.short.toLowerCase().includes(term) ||
        t.full.toLowerCase().includes(term),
    );
  }, [search]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Glossário</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.searchWrapper}>
        <Feather name="search" size={16} color={colors.text.tertiary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar termo"
          placeholderTextColor={colors.text.tertiary}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
            <Feather name="x-circle" size={16} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.term}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListHeaderComponent={
          <Text style={styles.intro}>
            Os termos que aparecem no app e na academia, explicados sem
            enrolação. Toque para ver a explicação completa.
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.muted}>Nenhum termo encontrado</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TermCard
            item={item}
            expanded={expanded === item.term}
            onToggle={() => setExpanded(expanded === item.term ? null : item.term)}
            onSelectRelated={(t) => setExpanded(t)}
          />
        )}
      />
    </SafeAreaView>
  );
}

function TermCard({
  item,
  expanded,
  onToggle,
  onSelectRelated,
}: {
  item: GlossaryTerm;
  expanded: boolean;
  onToggle: () => void;
  onSelectRelated: (term: string) => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <TouchableOpacity style={styles.card} onPress={onToggle} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.cardText}>
          <Text style={styles.term}>{item.term}</Text>
          <Text style={styles.short}>{item.short}</Text>
        </View>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.text.tertiary}
        />
      </View>

      {expanded && (
        <View style={styles.cardBody}>
          <Text style={styles.full}>{item.full}</Text>
          {item.related && item.related.length > 0 && (
            <View style={styles.relatedRow}>
              {item.related.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={styles.relatedChip}
                  onPress={() => onSelectRelated(r)}
                >
                  <Text style={styles.relatedLabel}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
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

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing['2xl'],
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.text.primary },

  list: { padding: spacing['2xl'], paddingBottom: spacing['4xl'] },
  intro: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg },

  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardText: { flex: 1, gap: 2 },
  term: { ...typography.subheading, color: colors.text.primary },
  short: { ...typography.bodySmall, color: colors.text.secondary },

  cardBody: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    gap: spacing.md,
  },
  full: { ...typography.body, color: colors.text.secondary },
  relatedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  relatedChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.accent.dim,
    borderWidth: 1,
    borderColor: colors.accent.border,
  },
  relatedLabel: { ...typography.labelSmall, color: colors.accent.default },

  center: { alignItems: 'center', paddingVertical: spacing['4xl'] },
  muted: { ...typography.body, color: colors.text.secondary },
});
