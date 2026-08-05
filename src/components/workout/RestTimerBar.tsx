import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatTime } from '@/lib/utils';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { fonts, radius, spacing, typography } from '@/theme';

interface Props {
  secondsLeft: number;
  total: number;
  onAdjust: (delta: number) => void;
  onSkip: () => void;
}

/** Barra flutuante de descanso — aparece sobre a tela de treino ativo */
export function RestTimerBar({ secondsLeft, total, onAdjust, onSkip }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const progress = total > 0 ? secondsLeft / total : 0;

  return (
    <View style={styles.wrapper}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.row}>
        <View style={styles.labelWrapper}>
          <Feather name="clock" size={16} color={colors.accent.default} />
          <Text style={styles.label}>Descanso</Text>
          <Text style={styles.time}>{formatTime(secondsLeft)}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.adjustBtn} onPress={() => onAdjust(-15)}>
            <Text style={styles.adjustLabel}>−15s</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.adjustBtn} onPress={() => onAdjust(15)}>
            <Text style={styles.adjustLabel}>+15s</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
            <Text style={styles.skipLabel}>Pular</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      bottom: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: colors.bg.elevated,
      borderWidth: 1,
      borderColor: colors.accent.border,
      overflow: 'hidden',
    },
    progressTrack: {
      height: 4,
      backgroundColor: colors.bg.surface,
    },
    progressFill: {
      height: 4,
      backgroundColor: colors.accent.default,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    labelWrapper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
    label: { ...typography.label, color: colors.text.secondary },
    time: {
      fontFamily: fonts.numBold,
      fontSize: 18,
      color: colors.accent.default,
    },
    actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    adjustBtn: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
      backgroundColor: colors.bg.surface,
    },
    adjustLabel: { ...typography.labelSmall, color: colors.text.secondary },
    skipBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
      backgroundColor: colors.accent.dim,
      borderWidth: 1,
      borderColor: colors.accent.border,
    },
    skipLabel: { ...typography.labelSmall, color: colors.accent.default },
  });
