import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { useAuth } from '@/features/auth/useAuth';
import { GOAL_LABEL, LEVEL_LABEL, EQUIPMENT_LABEL } from '@/features/splits/splitService';
import { useProfile, useUpdateProfile } from '@/features/profile/useProfile';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [dirty, setDirty] = useState(false);

  // Popula os campos quando o perfil carrega
  useEffect(() => {
    if (!profile) return;
    setName(profile.display_name ?? '');
    setWeight(profile.body_weight != null ? String(profile.body_weight) : '');
    setDirty(false);
  }, [profile]);

  function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Nome obrigatório', 'Informe um nome de exibição.');
      return;
    }
    const parsedWeight = weight.trim() === '' ? null : parseFloat(weight.replace(',', '.'));
    if (parsedWeight !== null && (isNaN(parsedWeight) || parsedWeight <= 0 || parsedWeight > 400)) {
      Alert.alert('Peso inválido', 'Informe um peso corporal válido em kg.');
      return;
    }

    updateProfile.mutate(
      { display_name: trimmedName, body_weight: parsedWeight },
      {
        onSuccess: () => {
          haptics.success();
          setDirty(false);
        },
        onError: () => Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.'),
      },
    );
  }

  const email = user?.email ?? '';
  const initial = (name || email || '?').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity
          onPress={() => router.push('/(app)/settings')}
          style={styles.headerBtn}
          hitSlop={8}
        >
          <Feather name="settings" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Avatar + e-mail */}
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
            <Text style={styles.email}>{email}</Text>
          </View>

          {isLoading ? (
            <Text style={styles.muted}>Carregando perfil…</Text>
          ) : (
            <>
              {/* Dados editáveis */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Nome de exibição</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={(v) => { setName(v); setDirty(true); }}
                  placeholder="Seu nome"
                  placeholderTextColor={colors.text.tertiary}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Peso corporal (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={(v) => { setWeight(v); setDirty(true); }}
                  placeholder="Ex.: 72"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.hint}>
                  Usado em exercícios de peso corporal e na sugestão de carga.
                </Text>
              </View>

              {/* Resumo do plano (do onboarding) */}
              {(profile?.goal || profile?.experience_level) && (
                <View style={styles.planCard}>
                  <Text style={styles.planTitle}>Seu plano</Text>
                  <View style={styles.planRow}>
                    {profile?.goal && <Chip label={GOAL_LABEL[profile.goal as keyof typeof GOAL_LABEL] ?? profile.goal} colors={colors} />}
                    {profile?.experience_level && (
                      <Chip label={LEVEL_LABEL[profile.experience_level as keyof typeof LEVEL_LABEL] ?? profile.experience_level} colors={colors} />
                    )}
                    {profile?.days_per_week && <Chip label={`${profile.days_per_week}x/semana`} colors={colors} />}
                    {profile?.equipment_profile && (
                      <Chip label={EQUIPMENT_LABEL[profile.equipment_profile as keyof typeof EQUIPMENT_LABEL] ?? profile.equipment_profile} colors={colors} />
                    )}
                  </View>
                  <TouchableOpacity onPress={() => router.push('/(app)/settings')}>
                    <Text style={styles.planLink}>Refazer em Configurações</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Button
                label="Salvar alterações"
                onPress={handleSave}
                disabled={!dirty}
                loading={updateProfile.isPending}
                style={styles.saveBtn}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Chip({ label, colors }: { label: string; colors: ThemeColors }) {
  return (
    <View
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        backgroundColor: colors.bg.elevated,
      }}
    >
      <Text style={{ ...typography.labelSmall, color: colors.text.secondary }}>{label}</Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg.base },
    flex: { flex: 1 },

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

    scroll: { padding: spacing['2xl'], gap: spacing.lg, paddingBottom: spacing['4xl'] },

    identity: { alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: radius.full,
      backgroundColor: colors.accent.dim,
      borderWidth: 1,
      borderColor: colors.accent.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: { ...typography.h1, color: colors.accent.default },
    email: { ...typography.body, color: colors.text.secondary },

    muted: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },

    field: { gap: spacing.sm },
    fieldLabel: { ...typography.label, color: colors.text.secondary },
    input: {
      height: 52,
      backgroundColor: colors.bg.elevated,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border.default,
      paddingHorizontal: spacing.lg,
      ...typography.body,
      color: colors.text.primary,
    },
    hint: { ...typography.bodySmall, color: colors.text.tertiary },

    planCard: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: colors.bg.surface,
      borderWidth: 1,
      borderColor: colors.border.default,
      gap: spacing.md,
    },
    planTitle: { ...typography.label, color: colors.text.secondary },
    planRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    planLink: { ...typography.bodySmall, color: colors.accent.default },

    saveBtn: { marginTop: spacing.sm },
  });
