import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/useAuth';
import { useResetOnboarding } from '@/features/profile/useProfile';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/theme';
import { ThemeColors, ThemePreference } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { value: 'light', label: 'Claro', icon: 'sun' },
  { value: 'dark', label: 'Escuro', icon: 'moon' },
  { value: 'system', label: 'Sistema', icon: 'smartphone' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const { signOut } = useAuth();
  const { colors, preference, setPreference } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const resetOnboarding = useResetOnboarding();

  function handleLogout() {
    Alert.alert('Sair da conta', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  function handleRedoOnboarding() {
    Alert.alert(
      'Refazer configuração inicial',
      'Isso reabre o assistente que monta um plano de treino. Suas fichas atuais não são apagadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Refazer',
          onPress: () =>
            resetOnboarding.mutate(undefined, {
              onSuccess: () => router.replace('/(app)/onboarding'),
              onError: () => Alert.alert('Erro', 'Não foi possível reabrir o assistente.'),
            }),
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Tema */}
        <Text style={styles.sectionLabel}>Aparência</Text>
        <View style={styles.card}>
          {THEME_OPTIONS.map((opt, i) => {
            const active = preference === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.themeRow, i > 0 && styles.rowDivider]}
                onPress={() => { setPreference(opt.value); haptics.light(); }}
                activeOpacity={0.75}
              >
                <Feather name={opt.icon} size={18} color={active ? colors.accent.default : colors.text.secondary} />
                <Text style={[styles.themeLabel, active && styles.themeLabelActive]}>{opt.label}</Text>
                {active && <Feather name="check" size={18} color={colors.accent.default} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Treino */}
        <Text style={styles.sectionLabel}>Treino</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleRedoOnboarding} activeOpacity={0.75}>
            <Feather name="refresh-ccw" size={18} color={colors.text.secondary} />
            <View style={styles.actionText}>
              <Text style={styles.actionLabel}>Refazer configuração inicial</Text>
              <Text style={styles.actionHint}>Gera um novo plano a partir das suas respostas</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Conta */}
        <Text style={styles.sectionLabel}>Conta</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleLogout} activeOpacity={0.75}>
            <Feather name="log-out" size={18} color={colors.feedback.danger} />
            <Text style={[styles.actionLabel, { color: colors.feedback.danger }]}>Sair da conta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Novux Forge · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg.base },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
    },
    headerBtn: { width: 38, alignItems: 'center' },
    headerTitle: { ...typography.subheading, color: colors.text.primary },

    scroll: { padding: spacing['2xl'], gap: spacing.sm, paddingBottom: spacing['4xl'] },

    sectionLabel: {
      ...typography.label,
      color: colors.text.secondary,
      marginTop: spacing.lg,
      marginBottom: spacing.xs,
    },
    card: {
      backgroundColor: colors.bg.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border.default,
      overflow: 'hidden',
    },

    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
    },
    rowDivider: { borderTopWidth: 1, borderTopColor: colors.border.subtle },
    themeLabel: { ...typography.body, color: colors.text.primary, flex: 1 },
    themeLabelActive: { color: colors.accent.default },

    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
    },
    actionText: { flex: 1, gap: 2 },
    actionLabel: { ...typography.body, color: colors.text.primary },
    actionHint: { ...typography.bodySmall, color: colors.text.tertiary },

    version: {
      ...typography.bodySmall,
      color: colors.text.tertiary,
      textAlign: 'center',
      marginTop: spacing['3xl'],
    },
  });
