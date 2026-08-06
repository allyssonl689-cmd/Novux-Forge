import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SetEntry } from '@/features/workouts/activeWorkoutStore';
import { useUnitStore } from '@/features/settings/unitStore';
import { toDisplayWeight, toKg } from '@/lib/units';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

interface Props {
  set: SetEntry;
  onChangeWeight: (val: string) => void;
  onChangeReps: (val: string) => void;
  onChangeRpe: (val: string) => void;
  onComplete: () => void;
  onUncomplete: () => void;
  onToggleWarmup: () => void;
  onRemove: () => void;
}

export function SetRow({
  set,
  onChangeWeight,
  onChangeReps,
  onChangeRpe,
  onComplete,
  onUncomplete,
  onToggleWarmup,
  onRemove,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const unit = useUnitStore((s) => s.unit);
  const displayWeight = toDisplayWeight(set.weightKg, unit);

  function handleWeightChange(text: string) {
    if (unit === 'kg' || text.trim() === '') {
      onChangeWeight(text);
      return;
    }
    const parsed = parseFloat(text.replace(',', '.'));
    onChangeWeight(isNaN(parsed) ? text : String(toKg(parsed, unit)));
  }

  return (
    <View style={[styles.row, set.completed && styles.rowCompleted]}>
      {/* Número da série / aquecimento */}
      <TouchableOpacity style={styles.setNumBtn} onPress={onToggleWarmup}>
        <Text style={[styles.setNum, set.isWarmup && styles.setNumWarmup]}>
          {set.isWarmup ? 'Q' : set.setNumber}
        </Text>
      </TouchableOpacity>

      {/* Peso */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, set.completed && styles.inputCompleted]}
          value={displayWeight !== null ? String(displayWeight) : ''}
          onChangeText={handleWeightChange}
          placeholder="—"
          placeholderTextColor={colors.text.tertiary}
          keyboardType="decimal-pad"
          editable={!set.completed}
          selectTextOnFocus
        />
        <Text style={styles.inputUnit}>{unit}</Text>
      </View>

      {/* Reps */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, set.completed && styles.inputCompleted]}
          value={set.reps !== null ? String(set.reps) : ''}
          onChangeText={onChangeReps}
          // A meta da ficha aparece como placeholder: o iniciante vê quantas
          // repetições deveria fazer antes de digitar o que realmente fez
          placeholder={set.targetReps !== null ? String(set.targetReps) : '—'}
          placeholderTextColor={colors.text.tertiary}
          keyboardType="number-pad"
          editable={!set.completed}
          selectTextOnFocus
        />
        <Text style={styles.inputUnit}>reps</Text>
      </View>

      {/* RPE — percepção de esforço, não se aplica a séries de aquecimento */}
      {!set.isWarmup && (
        <View style={styles.rpeWrapper}>
          <TextInput
            style={[styles.input, set.completed && styles.inputCompleted]}
            value={set.rpe !== null ? String(set.rpe) : ''}
            onChangeText={onChangeRpe}
            placeholder="—"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="number-pad"
            maxLength={2}
            editable={!set.completed}
            selectTextOnFocus
          />
        </View>
      )}

      {/* PR badge */}
      {set.isPersonalRecord && (
        <View style={styles.prBadge}>
          <Text style={styles.prText}>PR</Text>
        </View>
      )}

      {/* Botão concluir / remover */}
      {set.completed ? (
        <TouchableOpacity style={styles.doneIcon} onPress={onUncomplete} hitSlop={8}>
          <Feather name="check-circle" size={22} color={colors.accent.default} />
        </TouchableOpacity>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.completeBtn} onPress={onComplete}>
            <Feather name="check" size={18} color={colors.accent.on} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onRemove} hitSlop={8}>
            <Feather name="trash-2" size={15} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.bg.elevated,
    },
    rowCompleted: {
      backgroundColor: colors.accent.dim,
    },

    setNumBtn: {
      width: 28,
      height: 28,
      borderRadius: radius.full,
      backgroundColor: colors.bg.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    setNum: { ...typography.label, color: colors.text.secondary },
    setNumWarmup: { color: colors.amber.default },

    inputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bg.surface,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border.default,
      paddingHorizontal: spacing.sm,
      height: 40,
      gap: 4,
    },
    input: {
      flex: 1,
      ...typography.subheading,
      color: colors.text.primary,
      textAlign: 'center',
    },
    inputCompleted: { color: colors.accent.default },
    inputUnit: { ...typography.bodySmall, color: colors.text.tertiary },

    rpeWrapper: {
      width: 40,
      alignItems: 'center',
      backgroundColor: colors.bg.surface,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border.default,
      height: 40,
      justifyContent: 'center',
    },

    prBadge: {
      backgroundColor: colors.amber.dim,
      borderWidth: 1,
      borderColor: colors.amber.border,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
    },
    prText: { ...typography.labelSmall, color: colors.amber.default },

    doneIcon: { width: 38, alignItems: 'center' },
    actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    completeBtn: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      backgroundColor: colors.accent.default,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
