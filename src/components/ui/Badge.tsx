import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

interface Props {
  label: string;
  variant?: 'accent' | 'amber' | 'success' | 'danger';
}

export function Badge({ label, variant = 'accent' }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.base, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles] as any]}>{label}</Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    base: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: radius.full,
      borderWidth: 1,
      alignSelf: 'flex-start',
    },
    accent: { backgroundColor: colors.accent.dim, borderColor: colors.accent.border },
    amber: { backgroundColor: colors.amber.dim, borderColor: colors.amber.border },
    success: { backgroundColor: colors.feedback.successDim, borderColor: colors.feedback.success },
    danger: { backgroundColor: colors.feedback.dangerDim, borderColor: colors.feedback.danger },
    text: { ...typography.labelSmall, color: colors.text.primary },
    accentText: { color: colors.accent.default },
    amberText: { color: colors.amber.default },
    successText: { color: colors.feedback.success },
    dangerText: { color: colors.feedback.danger },
  });
