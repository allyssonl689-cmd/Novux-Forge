import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useConfirm } from '@/components/ui';
import {
  useBodyMeasurements,
  useDeleteBodyMeasurement,
  useLogBodyMeasurement,
} from '@/features/profile/useBodyMeasurements';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { fonts, radius, spacing, typography } from '@/theme';

function formatDate(iso: string): string {
  // measured_at é `date` puro (YYYY-MM-DD) — parsear como local evita o
  // "dia anterior" que o fuso UTC causaria perto da meia-noite.
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function WeightLogCard() {
  const { colors } = useTheme();
  const confirm = useConfirm();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data: measurements = [], isLoading } = useBodyMeasurements();
  const logMeasurement = useLogBodyMeasurement();
  const deleteMeasurement = useDeleteBodyMeasurement();
  const [input, setInput] = useState('');

  const chronological = useMemo(() => measurements.slice().reverse(), [measurements]);
  const latest = measurements[0] ?? null;
  const previous = measurements[1] ?? null;
  const delta = latest && previous ? latest.weight_kg - previous.weight_kg : null;

  const chartData = chronological.slice(-10);
  const min = chartData.length ? Math.min(...chartData.map((m) => m.weight_kg)) : 0;
  const max = chartData.length ? Math.max(...chartData.map((m) => m.weight_kg)) : 0;
  const range = max - min;

  function handleLog() {
    const weight = parseFloat(input.replace(',', '.'));
    if (isNaN(weight) || weight <= 0 || weight > 400) {
      confirm({ title: 'Peso inválido', message: 'Informe um peso corporal válido em kg.', actions: [{ key: 'ok', label: 'OK' }] });
      return;
    }
    logMeasurement.mutate(
      { weightKg: weight },
      {
        onSuccess: () => setInput(''),
        onError: () => confirm({ title: 'Erro', message: 'Não foi possível registrar. Tente novamente.', actions: [{ key: 'ok', label: 'OK' }] }),
      },
    );
  }

  async function handleDelete(id: string) {
    const action = await confirm({
      title: 'Remover registro',
      message: 'Excluir esta pesagem do histórico?',
      actions: [
        { key: 'cancel', label: 'Cancelar', variant: 'secondary' },
        { key: 'remove', label: 'Excluir', variant: 'danger' },
      ],
    });
    if (action === 'remove') deleteMeasurement.mutate(id);
  }

  if (isLoading) return null;

  return (
    <View style={styles.wrapper}>
      {/* Peso atual + variação */}
      <View style={styles.summaryRow}>
        <View>
          <Text style={styles.currentWeight}>
            {latest ? `${latest.weight_kg} kg` : '—'}
          </Text>
          <Text style={styles.currentLabel}>
            {latest ? `Pesagem de ${formatDate(latest.measured_at)}` : 'Sem registros ainda'}
          </Text>
        </View>
        {delta !== null && (
          <View
            style={[
              styles.deltaChip,
              delta <= 0 ? styles.deltaChipDown : styles.deltaChipUp,
            ]}
          >
            <Feather
              name={delta <= 0 ? 'trending-down' : 'trending-up'}
              size={12}
              color={delta <= 0 ? colors.feedback.success : colors.amber.default}
            />
            <Text
              style={[
                styles.deltaLabel,
                { color: delta <= 0 ? colors.feedback.success : colors.amber.default },
              ]}
            >
              {delta > 0 ? '+' : ''}{delta.toFixed(1)} kg
            </Text>
          </View>
        )}
      </View>

      {/* Sparkline dos últimos registros */}
      {chartData.length > 1 && (
        <View style={styles.chart}>
          {chartData.map((m, i) => {
            const pct = range > 0 ? (m.weight_kg - min) / range : 0.5;
            return (
              <View key={m.id} style={styles.barWrapper}>
                <View style={[styles.bar, { height: 6 + pct * 40 }]} />
                {i === chartData.length - 1 && <View style={styles.barDotToday} />}
              </View>
            );
          })}
        </View>
      )}

      {/* Registrar pesagem */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Peso de hoje (kg)"
          placeholderTextColor={colors.text.tertiary}
          keyboardType="decimal-pad"
          returnKeyType="done"
          onSubmitEditing={handleLog}
        />
        <TouchableOpacity
          style={styles.logBtn}
          onPress={handleLog}
          disabled={logMeasurement.isPending || input.trim() === ''}
        >
          <Feather name="plus" size={16} color={colors.accent.on} />
        </TouchableOpacity>
      </View>

      {/* Últimos registros */}
      {measurements.length > 0 && (
        <View style={styles.history}>
          {measurements.slice(0, 5).map((m) => (
            <View key={m.id} style={styles.historyRow}>
              <Text style={styles.historyDate}>{formatDate(m.measured_at)}</Text>
              <Text style={styles.historyWeight}>{m.weight_kg} kg</Text>
              <TouchableOpacity onPress={() => handleDelete(m.id)} hitSlop={8}>
                <Feather name="trash-2" size={14} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: { gap: spacing.lg },

    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    currentWeight: { fontFamily: fonts.numBold, fontSize: 32, color: colors.text.primary },
    currentLabel: { ...typography.bodySmall, color: colors.text.tertiary, marginTop: 2 },
    deltaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.full,
    },
    deltaChipDown: { backgroundColor: colors.feedback.successDim },
    deltaChipUp: { backgroundColor: colors.amber.dim },
    deltaLabel: { ...typography.labelSmall },

    chart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.sm,
      height: 46,
      paddingTop: spacing.sm,
    },
    barWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
    bar: {
      width: '100%',
      maxWidth: 18,
      borderRadius: radius.sm,
      backgroundColor: colors.accent.default,
    },
    barDotToday: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.accent.default,
      marginTop: 4,
    },

    form: { flexDirection: 'row', gap: spacing.sm },
    input: {
      flex: 1,
      height: 44,
      backgroundColor: colors.bg.elevated,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border.default,
      paddingHorizontal: spacing.lg,
      ...typography.body,
      color: colors.text.primary,
    },
    logBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.accent.default,
      alignItems: 'center',
      justifyContent: 'center',
    },

    history: { gap: spacing.xs },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.xs,
    },
    historyDate: { ...typography.bodySmall, color: colors.text.tertiary, width: 56 },
    historyWeight: { ...typography.bodySmall, color: colors.text.primary, flex: 1 },
  });
