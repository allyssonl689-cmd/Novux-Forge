import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeScreen } from '@/components/layout';
import { ScreenHeader } from '@/components/layout';
import { colors, spacing, typography } from '@/theme';

export default function ExercisesScreen() {
  return (
    <SafeScreen>
      <ScreenHeader title="Exercícios" />
      <Text style={styles.placeholder}>Biblioteca de exercícios — Fase 4</Text>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  placeholder: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginTop: spacing['4xl'] },
});
