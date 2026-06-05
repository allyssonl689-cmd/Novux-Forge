import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeScreen } from '@/components/layout';
import { ScreenHeader } from '@/components/layout';
import { colors, spacing, typography } from '@/theme';

export default function HomeScreen() {
  return (
    <SafeScreen>
      <ScreenHeader title="Home" />
      <Text style={styles.placeholder}>Dashboard — Fase 3</Text>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  placeholder: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginTop: spacing['4xl'] },
});
