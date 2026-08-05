import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  evaluatePassword,
  passwordScore,
  passwordStrengthLabel,
} from '@/features/auth/passwordStrength';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

interface Props {
  password: string;
}

/** Checklist de força de senha, com barra e rótulo qualitativo */
export function PasswordStrength({ password }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const checks = evaluatePassword(password);
  const score = passwordScore(password);

  if (!password) return null;

  const barColor =
    score <= 1 ? colors.feedback.danger : score <= 3 ? colors.amber.default : colors.feedback.success;

  return (
    <View style={styles.wrapper}>
      <View style={styles.barRow}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[styles.barSegment, { backgroundColor: i < score ? barColor : colors.bg.elevated }]}
          />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color: barColor }]}>
        {passwordStrengthLabel(score)}
      </Text>

      <View style={styles.checks}>
        {checks.map((c) => (
          <View key={c.key} style={styles.checkRow}>
            <Feather
              name={c.passed ? 'check-circle' : 'circle'}
              size={13}
              color={c.passed ? colors.feedback.success : colors.text.tertiary}
            />
            <Text style={[styles.checkLabel, c.passed && styles.checkLabelPassed]}>{c.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: { gap: spacing.sm, marginTop: spacing.xs },
    barRow: { flexDirection: 'row', gap: 4 },
    barSegment: { flex: 1, height: 4, borderRadius: radius.full },
    strengthLabel: { ...typography.labelSmall },
    checks: { gap: spacing.xs },
    checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    checkLabel: { ...typography.bodySmall, color: colors.text.tertiary },
    checkLabelPassed: { color: colors.text.secondary },
  });
