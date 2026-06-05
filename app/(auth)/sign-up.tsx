import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button } from '@/components/ui';
import { SafeScreen } from '@/components/layout';
import { ScreenHeader } from '@/components/layout';
import { colors, spacing, typography } from '@/theme';

export default function SignUpScreen() {
  const router = useRouter();
  return (
    <SafeScreen>
      <ScreenHeader title="Criar conta" showBack />
      <Text style={styles.placeholder}>Formulário de cadastro — Fase 2</Text>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  placeholder: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginTop: spacing['4xl'] },
});
