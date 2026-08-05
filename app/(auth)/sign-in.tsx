import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
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
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/features/auth/useAuth';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { fonts, spacing, typography } from '@/theme';

const schema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, requestPasswordReset } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  async function onForgotPassword() {
    const email = getValues('email').trim();
    if (!email || !email.includes('@')) {
      Alert.alert('Esqueci minha senha', 'Digite seu e-mail no campo acima e toque novamente.');
      return;
    }
    try {
      await requestPasswordReset(email);
      Alert.alert(
        'E-mail enviado',
        `Enviamos um link de redefinição para ${email}. Verifique sua caixa de entrada e o spam.`,
      );
    } catch (err: any) {
      Alert.alert('Erro', err?.message ?? 'Não foi possível enviar o e-mail.');
    }
  }

  async function onSubmit({ email, password }: FormData) {
    try {
      setLoading(true);
      await signIn(email, password);
      // AuthGate cuida do redirect automaticamente
    } catch (err: any) {
      Alert.alert('Erro ao entrar', err?.message ?? 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeScreen style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.brand}>Novux Forge</Text>
            <Text style={styles.tagline}>Seu tracking de treinos</Text>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
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
                <Input
                  label="Senha"
                  placeholder="••••••••"
                  secureTextEntry
                  returnKeyType="done"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />

            <Button
              label="Entrar"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.btnPrimary}
            />

            <TouchableOpacity onPress={onForgotPassword} style={styles.forgotBtn}>
              <Text style={styles.forgotLabel}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>

          {/* Rodapé */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Ainda não tem conta?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
              <Text style={styles.footerLink}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  screen:      { flex: 1 },
  flex:        { flex: 1 },
  container:   { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing['2xl'], paddingVertical: spacing['4xl'] },
  header:      { alignItems: 'center', marginBottom: spacing['4xl'] },
  brand:       { ...typography.display, color: colors.text.primary, textAlign: 'center' },
  tagline:     { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm },
  form:        { gap: spacing.lg },
  btnPrimary:  { marginTop: spacing.sm },
  forgotBtn:   { alignSelf: 'center', paddingVertical: spacing.xs },
  forgotLabel: { ...typography.bodySmall, color: colors.text.secondary },
  footer:      { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, marginTop: spacing['3xl'] },
  footerText:  { ...typography.body, color: colors.text.secondary },
  footerLink:  { ...typography.body, color: colors.accent.default, fontFamily: fonts.semiBold },
});
