import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

interface Props extends TouchableOpacityProps {
  label: string;
  loading?: boolean;
}

/**
 * Botão com o gradiente da marca (laranja → magenta). É o gesto visual central
 * do rebrand Ember; usar no CTA principal de cada tela.
 */
export function GradientButton({ label, loading, style, disabled, ...rest }: Props) {
  const { colors, gradient } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const off = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={off}
      style={[styles.wrapper, off && styles.disabled, style]}
      {...rest}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={colors.accent.on} />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      height: 52,
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    disabled: { opacity: 0.5 },
    gradient: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing['2xl'],
    },
    label: {
      ...typography.subheading,
      color: colors.accent.on,
    },
  });
