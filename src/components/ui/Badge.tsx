import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

interface Props {
  label: string;
  variant?: 'accent' | 'amber' | 'success' | 'danger';
}

export function Badge({ label, variant = 'accent' }: Props) {
  return (
    <View style={[styles.base, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles] as any]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  accent: { backgroundColor: colors.accent.dim, borderColor: colors.accent.border },
  amber:  { backgroundColor: colors.amber.dim,  borderColor: colors.amber.border  },
  success: { backgroundColor: 'rgba(45,212,164,0.12)', borderColor: 'rgba(45,212,164,0.25)' },
  danger:  { backgroundColor: 'rgba(255,71,87,0.12)',  borderColor: 'rgba(255,71,87,0.25)'  },
  text: { ...typography.labelSmall, color: colors.text.primary },
  accentText:  { color: colors.accent.default },
  amberText:   { color: colors.amber.default  },
  successText: { color: colors.feedback.success },
  dangerText:  { color: colors.feedback.danger  },
});
