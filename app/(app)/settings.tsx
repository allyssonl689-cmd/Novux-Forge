import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConfirm } from '@/components/ui';
import { useAuth } from '@/features/auth/useAuth';
import { useReminderStore } from '@/features/notifications/reminderStore';
import { useDeleteAccount, useResetAccount, useResetOnboarding } from '@/features/profile/useProfile';
import { clearActiveWorkoutLocal } from '@/features/workouts/activeWorkoutStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/theme';
import { ThemeColors, ThemePreference } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { value: 'light', label: 'Claro', icon: 'sun' },
  { value: 'dark', label: 'Escuro', icon: 'moon' },
  { value: 'system', label: 'Sistema', icon: 'smartphone' },
];

const REMINDER_TIME_OPTIONS: { hour: number; minute: number }[] = [
  { hour: 6, minute: 0 },
  { hour: 7, minute: 0 },
  { hour: 8, minute: 0 },
  { hour: 9, minute: 0 },
];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export default function SettingsScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const confirm = useConfirm();
  const { signOut, signOutLocal } = useAuth();
  const { colors, preference, setPreference } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const resetOnboarding = useResetOnboarding();
  const resetAccount = useResetAccount();
  const deleteAccount = useDeleteAccount();
  const reminderEnabled = useReminderStore((s) => s.enabled);
  const reminderHour = useReminderStore((s) => s.hour);
  const reminderMinute = useReminderStore((s) => s.minute);
  const setReminderEnabled = useReminderStore((s) => s.setEnabled);
  const setReminderTime = useReminderStore((s) => s.setTime);

  async function handleLogout() {
    const action = await confirm({
      title: 'Sair da conta',
      message: 'Deseja encerrar a sessão?',
      actions: [
        { key: 'cancel', label: 'Cancelar', variant: 'secondary' },
        { key: 'logout', label: 'Sair', variant: 'danger' },
      ],
    });
    if (action === 'logout') signOut();
  }

  async function handleRedoOnboarding() {
    const action = await confirm({
      title: 'Refazer configuração inicial',
      message: 'Isso reabre o assistente que monta um plano de treino. Suas fichas atuais não são apagadas.',
      actions: [
        { key: 'cancel', label: 'Cancelar', variant: 'secondary' },
        { key: 'redo', label: 'Refazer' },
      ],
    });
    if (action !== 'redo') return;
    resetOnboarding.mutate(undefined, {
      onSuccess: () => router.replace('/(app)/onboarding'),
      onError: () => confirm({ title: 'Erro', message: 'Não foi possível reabrir o assistente.', actions: [{ key: 'ok', label: 'OK' }] }),
    });
  }

  async function handleResetAccount() {
    const action = await confirm({
      title: 'Resetar conta',
      message:
        'Isso apaga TODO o seu histórico de treinos, peso corporal registrado e todas as fichas — para sempre. Seu login continua o mesmo. Você vai refazer o assistente inicial para gerar fichas novas. Essa ação não pode ser desfeita.',
      actions: [
        { key: 'cancel', label: 'Cancelar', variant: 'secondary' },
        { key: 'reset', label: 'Resetar tudo', variant: 'danger' },
      ],
    });
    if (action !== 'reset') return;

    resetAccount.mutate(undefined, {
      onSuccess: () => {
        clearActiveWorkoutLocal();
        haptics.success();
        router.replace('/(app)/onboarding');
      },
      onError: () =>
        confirm({ title: 'Erro', message: 'Não foi possível resetar a conta. Tente novamente.', actions: [{ key: 'ok', label: 'OK' }] }),
    });
  }

  async function handleDeleteAccount() {
    const step1 = await confirm({
      title: 'Excluir minha conta',
      message:
        'Isso apaga PERMANENTEMENTE sua conta, login, histórico, fichas e fotos. É diferente do "resetar conta": aqui não dá para continuar usando o mesmo login depois — seria preciso se cadastrar de novo.',
      actions: [
        { key: 'cancel', label: 'Cancelar', variant: 'secondary' },
        { key: 'continue', label: 'Continuar' },
      ],
    });
    if (step1 !== 'continue') return;

    const step2 = await confirm({
      title: 'Tem certeza mesmo?',
      message: 'Essa é a confirmação final. Sua conta será excluída agora e não pode ser recuperada depois.',
      actions: [
        { key: 'cancel', label: 'Cancelar', variant: 'secondary' },
        { key: 'delete', label: 'Excluir para sempre', variant: 'danger' },
      ],
    });
    if (step2 !== 'delete') return;

    deleteAccount.mutate(undefined, {
      onSuccess: async () => {
        clearActiveWorkoutLocal();
        await signOutLocal();
      },
      onError: () =>
        confirm({ title: 'Erro', message: 'Não foi possível excluir a conta. Tente novamente.', actions: [{ key: 'ok', label: 'OK' }] }),
    });
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

        {/* Notificações */}
        <Text style={styles.sectionLabel}>Notificações</Text>
        <View style={styles.card}>
          <View style={styles.actionRow}>
            <Feather name="bell" size={18} color={colors.text.secondary} />
            <View style={styles.actionText}>
              <Text style={styles.actionLabel}>Lembrete diário de treino</Text>
              <Text style={styles.actionHint}>Avisa nos dias com ficha marcada na agenda</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={(v) => { setReminderEnabled(v); haptics.light(); }}
              trackColor={{ true: colors.accent.default, false: colors.border.strong }}
              thumbColor="#FFFFFF"
            />
          </View>
          {reminderEnabled && (
            <View style={[styles.reminderTimes, styles.rowDivider]}>
              {REMINDER_TIME_OPTIONS.map((opt) => {
                const active = opt.hour === reminderHour && opt.minute === reminderMinute;
                return (
                  <TouchableOpacity
                    key={`${opt.hour}:${opt.minute}`}
                    style={[styles.timeChip, active && styles.timeChipActive]}
                    onPress={() => { setReminderTime(opt.hour, opt.minute); haptics.light(); }}
                  >
                    <Text style={[styles.timeChipLabel, active && styles.timeChipLabelActive]}>
                      {pad2(opt.hour)}:{pad2(opt.minute)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Conta */}
        <Text style={styles.sectionLabel}>Conta</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleResetAccount} activeOpacity={0.75}>
            <Feather name="trash-2" size={18} color={colors.feedback.danger} />
            <View style={styles.actionText}>
              <Text style={[styles.actionLabel, { color: colors.feedback.danger }]}>Resetar conta</Text>
              <Text style={styles.actionHint}>Apaga histórico e fichas — recomeça do zero</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionRow, styles.rowDivider]} onPress={handleLogout} activeOpacity={0.75}>
            <Feather name="log-out" size={18} color={colors.feedback.danger} />
            <Text style={[styles.actionLabel, { color: colors.feedback.danger }]}>Sair da conta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionRow, styles.rowDivider]} onPress={handleDeleteAccount} activeOpacity={0.75}>
            <Feather name="x-octagon" size={18} color={colors.feedback.danger} />
            <View style={styles.actionText}>
              <Text style={[styles.actionLabel, { color: colors.feedback.danger }]}>Excluir minha conta</Text>
              <Text style={styles.actionHint}>Apaga tudo, inclusive o login — não pode ser desfeito</Text>
            </View>
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

    reminderTimes: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
    },
    timeChip: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: colors.bg.elevated,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    timeChipActive: { backgroundColor: colors.accent.dim, borderColor: colors.accent.border },
    timeChipLabel: { ...typography.label, color: colors.text.secondary },
    timeChipLabelActive: { color: colors.accent.default },

    version: {
      ...typography.bodySmall,
      color: colors.text.tertiary,
      textAlign: 'center',
      marginTop: spacing['3xl'],
    },
  });
