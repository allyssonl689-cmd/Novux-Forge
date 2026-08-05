import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScoreResult } from '@/features/stats/scoring';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { fonts, radius, spacing, typography } from '@/theme';

/** Cor do score pela faixa — pareada sempre com o número + rótulo (nunca só cor) */
export function scoreColor(colors: ThemeColors, label: ScoreResult['label']): string {
  if (label === 'Crítico') return colors.feedback.danger;
  if (label === 'Atenção') return colors.amber.default;
  if (label === 'Bom') return colors.accent.default;
  return colors.feedback.success;
}

interface Props {
  score: ScoreResult;
  compact?: boolean;
}

/** Medidor de score em barra (0–1000) — sem lib de gráfico */
export function ScoreRing({ score, compact }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const color = scoreColor(colors, score.label);
  const pct = Math.max(0, Math.min(1, score.score / 1000));

  return (
    <View style={styles.wrapper}>
      <View style={styles.top}>
        <Text style={[styles.value, { color }]}>{score.score}</Text>
        <Text style={styles.max}>/ 1000</Text>
        <View style={[styles.labelPill, { borderColor: color }]}>
          <Text style={[styles.labelText, { color }]}>{score.label}</Text>
        </View>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>

      {!compact && (
        <View style={styles.parts}>
          <Part label="Consistência" value={score.parts.consistency} max={400} colors={colors} />
          <Part label="Volume" value={score.parts.volume} max={200} colors={colors} />
          <Part label="Progressão" value={score.parts.progression} max={200} colors={colors} />
          <Part label="Equilíbrio" value={score.parts.balance} max={200} colors={colors} />
        </View>
      )}
    </View>
  );
}

function Part({ label, value, max, colors }: { label: string; value: number; max: number; colors: ThemeColors }) {
  const pct = max > 0 ? value / max : 0;
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ ...typography.bodySmall, color: colors.text.secondary }}>{label}</Text>
        <Text style={{ ...typography.bodySmall, color: colors.text.tertiary }}>{value}/{max}</Text>
      </View>
      <View style={{ height: 6, borderRadius: radius.full, backgroundColor: colors.bg.elevated, overflow: 'hidden' }}>
        <View style={{ height: 6, width: `${pct * 100}%`, backgroundColor: colors.accent.default }} />
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: { gap: spacing.md },
    top: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
    value: { fontFamily: fonts.numExtraBold, fontSize: 44, lineHeight: 46 },
    max: { ...typography.body, color: colors.text.tertiary },
    labelPill: {
      marginLeft: 'auto',
      alignSelf: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: 3,
      borderRadius: radius.full,
      borderWidth: 1,
    },
    labelText: { ...typography.label },
    track: { height: 10, borderRadius: radius.full, backgroundColor: colors.bg.elevated, overflow: 'hidden' },
    fill: { height: 10, borderRadius: radius.full },
    parts: { gap: spacing.sm, marginTop: spacing.xs },
  });
