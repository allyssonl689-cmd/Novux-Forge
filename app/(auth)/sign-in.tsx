import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui';
import { SafeScreen } from '@/components/layout';
import { colors, spacing, typography } from '@/theme';

export default function SignInScreen() {
  const router = useRouter();
  return (
    <SafeScreen style={styles.container}>
      <Text style={styles.title}>Novux Forge</Text>
      <Text style={styles.subtitle}>Seu tracking de treinos</Text>
      <View style={styles.actions}>
        <Button label="Entrar" onPress={() => {}} />
        <Button label="Criar conta" variant="secondary" onPress={() => router.push('/(auth)/sign-up')} />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing['2xl'] },
  title:    { ...typography.display, color: colors.accent.default, textAlign: 'center' },
  subtitle: { ...typography.body,    color: colors.text.secondary,  textAlign: 'center', marginTop: spacing.sm },
  actions:  { gap: spacing.md, marginTop: spacing['4xl'] },
});
