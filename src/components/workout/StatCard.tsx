import { BlurView } from 'expo-blur';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

interface Props {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
}

export function StatCard({ label, value, unit, accent = false }: Props) {
  const { colors, mode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.wrapper}>
      <BlurView intensity={18} tint={mode === 'dark' ? 'dark' : 'light'} style={styles.blur}>
        <View style={[styles.inner, accent && styles.innerAccent]}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.valueRow}>
            <Text style={[styles.value, accent && styles.valueAccent]}>{value}</Text>
            {unit && <Text style={styles.unit}>{unit}</Text>}
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      borderRadius: radius.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    blur: {
      flex: 1,
    },
    inner: {
      flex: 1,
      padding: spacing.lg,
      backgroundColor: colors.bg.card,
      gap: spacing.xs,
    },
    innerAccent: {
      backgroundColor: colors.accent.dim,
      borderColor: colors.accent.border,
    },
    label: {
      ...typography.label,
      color: colors.text.secondary,
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.xs,
    },
    // KPI em Outfit (papel numérico da marca)
    value: {
      ...typography.metricSmall,
      color: colors.text.primary,
    },
    valueAccent: {
      color: colors.accent.default,
    },
    unit: {
      ...typography.bodySmall,
      color: colors.text.secondary,
      marginBottom: 3,
    },
  });
