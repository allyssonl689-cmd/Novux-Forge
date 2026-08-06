import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConfirm } from '@/components/ui';
import { useHistory } from '@/features/history/useHistory';
import { WorkoutLogSummary } from '@/features/history/historyService';
import { exportHistoryCsv } from '@/features/history/exportService';
import { useUnitStore } from '@/features/settings/unitStore';
import { formatVolume } from '@/lib/units';
import { formatTime } from '@/lib/utils';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function HistoryCard({ log, onPress }: { log: WorkoutLogSummary; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const unit = useUnitStore((s) => s.unit);
  const volume = formatVolume(log.total_volume_kg, unit);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Linha superior: nome + data */}
      <View style={styles.cardTop}>
        <Text style={styles.cardName} numberOfLines={1}>{log.name}</Text>
        <Text style={styles.cardDate}>{formatDate(log.started_at)}</Text>
      </View>

      {/* Métricas */}
      <View style={styles.cardStats}>
        <View style={styles.stat}>
          <Feather name="clock" size={13} color={colors.text.tertiary} />
          <Text style={styles.statText}>
            {log.duration_secs ? formatTime(log.duration_secs) : '—'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Feather name="activity" size={13} color={colors.text.tertiary} />
          <Text style={styles.statText}>{log.exercise_count} exercícios</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Feather name="trending-up" size={13} color={colors.text.tertiary} />
          <Text style={styles.statText}>{volume.value} {volume.unitLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const confirm = useConfirm();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data: logs = [], isLoading, isError, refetch } = useHistory();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      await exportHistoryCsv();
    } catch (err: any) {
      confirm({ title: 'Erro ao exportar', message: err?.message ?? 'Tente novamente.', actions: [{ key: 'ok', label: 'OK' }] });
    } finally {
      setExporting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Histórico</Text>
          {!isLoading && (
            <Text style={styles.subtitle}>{logs.length} treino{logs.length !== 1 ? 's' : ''}</Text>
          )}
        </View>
        {!isLoading && logs.length > 0 && (
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport} disabled={exporting} hitSlop={8}>
            {exporting ? (
              <ActivityIndicator size="small" color={colors.text.secondary} />
            ) : (
              <Feather name="download" size={18} color={colors.text.secondary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent.default} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={32} color={colors.text.tertiary} />
          <Text style={styles.muted}>Erro ao carregar histórico</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryLabel}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.center}>
          <Feather name="inbox" size={48} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Nenhum treino ainda</Text>
          <Text style={styles.muted}>Complete seu primeiro treino para ver o histórico aqui.</Text>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => router.push('/(app)/workout/active')}
          >
            <Feather name="play" size={16} color={colors.text.inverse} />
            <Text style={styles.startLabel}>Iniciar treino</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList<WorkoutLogSummary>
          data={logs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <HistoryCard
              log={item}
              onPress={() => router.push(`/(app)/history/${item.id}`)}
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
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title:    { ...typography.h2, color: colors.text.primary },
  subtitle: { ...typography.bodySmall, color: colors.text.tertiary },
  exportBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Card
  list:      { paddingHorizontal: spacing['2xl'], paddingTop: spacing.md, paddingBottom: spacing['4xl'] },
  separator: { height: spacing.sm },
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  cardName: { ...typography.subheading, color: colors.text.primary, flex: 1 },
  cardDate: { ...typography.bodySmall, color: colors.text.tertiary, flexShrink: 0 },
  cardStats: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stat:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText:  { ...typography.bodySmall, color: colors.text.secondary },
  statDivider: { width: 1, height: 12, backgroundColor: colors.border.default },

  // Estados
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing['2xl'] },
  muted:      { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  emptyTitle: { ...typography.h3, color: colors.text.primary },
  retryBtn: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  retryLabel: { ...typography.label, color: colors.text.primary },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent.default,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
  startLabel: { ...typography.label, color: colors.text.inverse },
});
