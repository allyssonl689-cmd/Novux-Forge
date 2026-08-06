import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { SafeScreen } from '@/components/layout';
import { ScreenHeader } from '@/components/layout';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { BrandLogo, Button, Input, useConfirm } from '@/components/ui';
import { useAuth } from '@/features/auth/useAuth';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { fonts, spacing, typography } from '@/theme';

const schema = z.object({
  fullName: z.string().min(2, 'Informe seu nome completo'),
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'As senhas não coincidem',
  path: ['confirm'],
});

type FormData = z.infer<typeof schema>;

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const confirm = useConfirm();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', password: '', confirm: '' },
  });

  async function onSubmit({ email, password, fullName }: FormData) {
    try {
      setLoading(true);
      await signUp(email, password, fullName);
      await confirm({
        title: 'Conta criada!',
        message: 'Verifique seu e-mail para confirmar o cadastro e depois faça o login.',
        actions: [{ key: 'ok', label: 'OK' }],
      });
      router.replace('/(auth)/sign-in');
    } catch (err: any) {
      confirm({ title: 'Erro ao criar conta', message: err?.message ?? 'Tente novamente.', actions: [{ key: 'ok', label: 'OK' }] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeScreen style={styles.screen}>
      <ScreenHeader title="Criar conta" showBack />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nome completo"
                  placeholder="João Silva"
                  autoCapitalize="words"
                  returnKeyType="next"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.fullName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="E-mail"
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={{ gap: spacing.sm }}>
                  <Input
                    label="Senha"
                    placeholder="••••••••"
                    secureTextEntry
                    returnKeyType="next"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.password?.message}
                  />
                  <PasswordStrength password={value} />
                </View>
              )}
            />

            <Controller
              control={control}
              name="confirm"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirmar senha"
                  placeholder="••••••••"
                  secureTextEntry
                  returnKeyType="done"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.confirm?.message}
                />
              )}
            />

            <Button
              label="Criar conta"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.btnPrimary}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem conta?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}>Entrar</Text>
            </TouchableOpacity>
          </View>

          <BrandLogo size={28} style={styles.footerLogo} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  screen:     { flex: 1 },
  flex:       { flex: 1 },
  container:  { flexGrow: 1, paddingHorizontal: spacing['2xl'], paddingTop: spacing['2xl'], paddingBottom: spacing['4xl'] },
  form:       { gap: spacing.lg },
  btnPrimary: { marginTop: spacing.sm },
  footer:     { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, marginTop: spacing['3xl'] },
  footerText: { ...typography.body, color: colors.text.secondary },
  footerLink: { ...typography.body, color: colors.accent.default, fontFamily: fonts.semiBold },
  footerLogo: { alignSelf: 'center', marginTop: spacing['2xl'], opacity: 0.8 },
});
