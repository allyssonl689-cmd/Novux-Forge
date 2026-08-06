import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

interface Props extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
}

export function Button({ label, variant = 'primary', loading, style, disabled, ...rest }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], (disabled || loading) && styles.disabled, style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? colors.accent.on : variant === 'danger' ? '#FFFFFF' : colors.accent.default} />
        : (
          <Text
            style={[
              styles.label,
              variant === 'danger' && styles.labelOnDanger,
              (variant === 'secondary' || variant === 'ghost') && styles.labelAlt,
            ]}
          >
            {label}
          </Text>
        )
      }
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    base: {
      height: 52,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing['2xl'],
    },
    primary: {
      backgroundColor: colors.accent.default,
    },
    secondary: {
      backgroundColor: colors.bg.elevated,
      borderWidth: 1,
      borderColor: colors.border.strong,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: colors.feedback.danger,
    },
    disabled: {
      opacity: 0.45,
    },
    label: {
      ...typography.subheading,
      color: colors.accent.on,
    },
    labelAlt: {
      color: colors.text.primary,
    },
    labelOnDanger: {
      color: '#FFFFFF',
    },
  });
