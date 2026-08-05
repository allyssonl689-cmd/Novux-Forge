import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Exercise } from '@/types/workout';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

const DIFFICULTY_LABEL: Record<Exercise['difficulty'], string> = {
  beginner:     'Iniciante',
  intermediate: 'Intermediário',
  advanced:     'Avançado',
};

/** Cor da dificuldade resolvida no tema ativo (não pode ser estática por causa do light mode) */
function difficultyColor(colors: ThemeColors, d: Exercise['difficulty']): string {
  if (d === 'beginner') return colors.feedback.success;
  if (d === 'advanced') return colors.feedback.danger;
  return colors.amber.default;
}

interface Props {
  exercise: Exercise;
  onPress: () => void;
}

export function ExerciseCard({ exercise, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Feather name="activity" size={18} color={colors.accent.default} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{exercise.name}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{exercise.muscle_group}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.metaText}>{exercise.equipment}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={[styles.difficulty, { color: difficultyColor(colors, exercise.difficulty) }]}>
            {DIFFICULTY_LABEL[exercise.difficulty]}
          </Text>
        </View>
      </View>

      <Feather name="chevron-right" size={18} color={colors.text.tertiary} />
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bg.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border.default,
      padding: spacing.lg,
      gap: spacing.md,
    },
    left: {},
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.accent.dim,
      borderWidth: 1,
      borderColor: colors.accent.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: { flex: 1, gap: 4 },
    name: { ...typography.subheading, color: colors.text.primary },
    meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
    metaText: { ...typography.bodySmall, color: colors.text.secondary },
    dot: { ...typography.bodySmall, color: colors.text.tertiary },
    difficulty: { ...typography.bodySmall },
  });
