import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Animated,
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
import { BrandLogo, Button, Input, useConfirm } from '@/components/ui';
import { useAuth } from '@/features/auth/useAuth';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { fonts, radius, spacing, typography } from '@/theme';

const schema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, requestPasswordReset } = useAuth();
  const confirm = useConfirm();
  const { colors, mode, toggle } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);

  // Entrada da logo: um "pump" com leve giro, como um rep concluído — depois consolida.
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoRotate = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 3, tension: 90, useNativeDriver: true }),
        Animated.spring(logoRotate, { toValue: 0, friction: 4, tension: 80, useNativeDriver: true }),
      ]),
    ]).start();
  }, [logoOpacity, logoScale, logoRotate]);

  const logoRotateDeg = logoRotate.interpolate({ inputRange: [-1, 0], outputRange: ['-10deg', '0deg'] });

  const { control, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  async function onForgotPassword() {
    const email = getValues('email').trim();
    if (!email || !email.includes('@')) {
      confirm({
        title: 'Esqueci minha senha',
        message: 'Digite seu e-mail no campo acima e toque novamente.',
        actions: [{ key: 'ok', label: 'OK' }],
      });
      return;
    }
    try {
      await requestPasswordReset(email);
      confirm({
        title: 'E-mail enviado',
        message: `Enviamos um link de redefinição para ${email}. Verifique sua caixa de entrada e o spam.`,
        actions: [{ key: 'ok', label: 'OK' }],
      });
    } catch (err: any) {
      confirm({ title: 'Erro', message: err?.message ?? 'Não foi possível enviar o e-mail.', actions: [{ key: 'ok', label: 'OK' }] });
    }
  }

  async function onSubmit({ email, password }: FormData) {
    try {
      setLoading(true);
      await signIn(email, password);
      // AuthGate cuida do redirect automaticamente
    } catch (err: any) {
      confirm({ title: 'Erro ao entrar', message: err?.message ?? 'Tente novamente.', actions: [{ key: 'ok', label: 'OK' }] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeScreen style={styles.screen}>
      <TouchableOpacity style={styles.themeBtn} onPress={toggle} hitSlop={8}>
        <Feather name={mode === 'dark' ? 'moon' : 'sun'} size={18} color={colors.text.secondary} />
      </TouchableOpacity>

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
            <Animated.View
              style={{
                opacity: logoOpacity,
                transform: [{ scale: logoScale }, { rotate: logoRotateDeg }],
              }}
            >
              <BrandLogo size={72} style={styles.logo} />
            </Animated.View>
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
  themeBtn: {
    position: 'absolute',
    top: spacing['3xl'],
    right: spacing.lg,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header:      { alignItems: 'center', marginBottom: spacing['4xl'] },
  logo:        { borderRadius: radius.xl, marginBottom: spacing.lg },
  brand:       {
    ...typography.display,
    fontSize: 32,
    lineHeight: 50,
    letterSpacing: -0.5,
    paddingBottom: spacing.xs,
    color: colors.text.primary,
    textAlign: 'center',
  },
  tagline:     { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm },
  form:        { gap: spacing.lg },
  btnPrimary:  { marginTop: spacing.sm },
  forgotBtn:   { alignSelf: 'center', paddingVertical: spacing.xs },
  forgotLabel: { ...typography.bodySmall, color: colors.text.secondary },
  footer:      { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, marginTop: spacing['3xl'] },
  footerText:  { ...typography.body, color: colors.text.secondary },
  footerLink:  { ...typography.body, color: colors.accent.default, fontFamily: fonts.semiBold },
});
