import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import {
  DAYS_OPTIONS,
  EQUIPMENT_OPTIONS,
  EXPERIENCE_OPTIONS,
  Equipment,
  Experience,
  GOAL_OPTIONS,
  Goal,
  WEEKDAY_SHORT,
  buildSchedule,
  distributeWeekdays,
  recommendSplitSlug,
} from '@/features/plan/recommendation';
import { useSaveOnboarding, useSetWeeklyPlan, useSkipOnboarding } from '@/features/plan/useWeeklyPlan';
import { applySplit, fetchSplitDetail } from '@/features/splits/splitService';
import { useSplitDetail, useSplits } from '@/features/splits/useSplits';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

const TOTAL_STEPS = 5;

export default function OnboardingScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: splits = [] } = useSplits();
  const saveOnboarding = useSaveOnboarding();
  const setWeeklyPlan = useSetWeeklyPlan();
  const skipOnboarding = useSkipOnboarding();

  const answers = useMemo(
    () =>
      goal && experience && daysPerWeek && equipment
        ? { goal, experience, daysPerWeek, equipment }
        : null,
    [goal, experience, daysPerWeek, equipment],
  );

  const recommended = useMemo(() => {
    if (!answers) return null;
    const slug = recommendSplitSlug(answers);
    return splits.find((s) => s.slug === slug) ?? null;
  }, [answers, splits]);

  const { data: recommendedDetail } = useSplitDetail(recommended?.id ?? null);

  async function handleFinish() {
    if (!answers || !recommended) return;
    setCreating(true);
    try {
      // Busca fora do cache para garantir a versão completa com os exercícios
      const detail = await fetchSplitDetail(recommended.id);
      const workouts = await applySplit(detail);

      // Distribui as fichas nos dias da semana, ciclando quando o usuário
      // treina mais dias do que a divisão tem (ABC em 6 dias = A B C A B C)
      const schedule = buildSchedule(answers.daysPerWeek, workouts);
      await setWeeklyPlan.mutateAsync(
        schedule.map((s) => ({ weekday: s.weekday, workout_id: s.workout.id })),
      );

      await saveOnboarding.mutateAsync(answers);
      haptics.success();
      router.replace('/(app)');
    } catch {
      setCreating(false);
      haptics.error();
      Alert.alert('Erro', 'Não foi possível montar seu plano. Tente novamente.');
    }
  }

  async function handleSkip() {
    await skipOnboarding.mutateAsync();
    router.replace('/(app)');
  }

  const canContinue =
    (step === 0) ||
    (step === 1 && !!goal) ||
    (step === 2 && !!experience) ||
    (step === 3 && !!daysPerWeek) ||
    (step === 4 && !!equipment);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Cabeçalho com progresso */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (step === 0 ? handleSkip() : setStep(step - 1))}
          style={styles.headerBtn}
          hitSlop={8}
        >
          <Feather
            name={step === 0 ? 'x' : 'arrow-left'}
            size={22}
            color={colors.text.secondary}
          />
        </TouchableOpacity>

        <View style={styles.dots}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity onPress={handleSkip} style={styles.headerBtn} hitSlop={8}>
          <Text style={styles.skipLabel}>Pular</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={styles.welcome}>
            <View style={styles.welcomeIcon}>
              <Feather name="zap" size={30} color={colors.accent.default} />
            </View>
            <Text style={styles.title}>Vamos montar seu treino</Text>
            <Text style={styles.subtitle}>
              Quatro perguntas rápidas e o app cria as fichas prontas, já
              distribuídas nos dias da semana. Dá para mudar tudo depois.
            </Text>
          </View>
        )}

        {step === 1 && (
          <Step title="Qual seu objetivo?" hint="Isso orienta a escolha da divisão de treino">
            {GOAL_OPTIONS.map((o) => (
              <Option
                key={o.value}
                label={o.label}
                hint={o.hint}
                selected={goal === o.value}
                onPress={() => { setGoal(o.value); haptics.light(); }}
              />
            ))}
          </Step>
        )}

        {step === 2 && (
          <Step title="Há quanto tempo você treina?" hint="Iniciante rende mais com treinos curtos e frequentes">
            {EXPERIENCE_OPTIONS.map((o) => (
              <Option
                key={o.value}
                label={o.label}
                hint={o.hint}
                selected={experience === o.value}
                onPress={() => { setExperience(o.value); haptics.light(); }}
              />
            ))}
          </Step>
        )}

        {step === 3 && (
          <Step title="Quantos dias por semana?" hint="Seja realista — constância vale mais que volume">
            <View style={styles.daysGrid}>
              {DAYS_OPTIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayBtn, daysPerWeek === d && styles.dayBtnActive]}
                  onPress={() => { setDaysPerWeek(d); haptics.light(); }}
                >
                  <Text style={[styles.dayNumber, daysPerWeek === d && styles.dayNumberActive]}>{d}</Text>
                  <Text style={[styles.dayUnit, daysPerWeek === d && styles.dayUnitActive]}>dias</Text>
                </TouchableOpacity>
              ))}
            </View>

            {daysPerWeek && (
              <View style={styles.weekPreview}>
                {WEEKDAY_SHORT.map((label, i) => {
                  const active = distributeWeekdays(daysPerWeek).includes(i);
                  return (
                    <View key={label} style={[styles.weekDay, active && styles.weekDayActive]}>
                      <Text style={[styles.weekDayLabel, active && styles.weekDayLabelActive]}>
                        {label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </Step>
        )}

        {step === 4 && (
          <Step title="Onde você vai treinar?" hint="Define quais exercícios entram nas suas fichas">
            {EQUIPMENT_OPTIONS.map((o) => (
              <Option
                key={o.value}
                label={o.label}
                hint={o.hint}
                selected={equipment === o.value}
                onPress={() => { setEquipment(o.value); haptics.light(); }}
              />
            ))}
          </Step>
        )}

        {step === 5 && (
          <Step title="Seu plano" hint="Montado a partir das suas respostas">
            {!recommended ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={colors.accent.default} />
                <Text style={styles.hint}>Escolhendo a melhor divisão…</Text>
              </View>
            ) : (
              <>
                <View style={styles.planCard}>
                  <Text style={styles.planName}>{recommended.name}</Text>
                  {recommended.subtitle && (
                    <Text style={styles.planSubtitle}>{recommended.subtitle}</Text>
                  )}
                  {recommended.description && (
                    <Text style={styles.planDescription}>{recommended.description}</Text>
                  )}
                </View>

                {recommendedDetail && answers && (
                  <View style={styles.scheduleCard}>
                    <Text style={styles.scheduleTitle}>Sua semana</Text>
                    {buildSchedule(answers.daysPerWeek, recommendedDetail.days).map((s) => (
                      <View key={s.weekday} style={styles.scheduleRow}>
                        <Text style={styles.scheduleDay}>{WEEKDAY_SHORT[s.weekday]}</Text>
                        <Text style={styles.scheduleWorkout} numberOfLines={1}>
                          {s.workout.label} — {s.workout.name}
                        </Text>
                      </View>
                    ))}
                    <Text style={styles.scheduleFooter}>
                      Os outros dias ficam livres para descanso.
                    </Text>
                  </View>
                )}
              </>
            )}
          </Step>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step < TOTAL_STEPS ? (
          <Button
            label={step === 0 ? 'Começar' : 'Continuar'}
            onPress={() => setStep(step + 1)}
            disabled={!canContinue}
          />
        ) : (
          <Button
            label="Criar meu plano"
            onPress={handleFinish}
            disabled={!recommended}
            loading={creating}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Blocos de UI ────────────────────────────────────────────────────────────

function Step({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.step}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>
      <View style={styles.options}>{children}</View>
    </View>
  );
}

function Option({
  label,
  hint,
  selected,
  onPress,
}: {
  label: string;
  hint: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.optionText}>
        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
        <Text style={styles.optionHint}>{hint}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected && <Feather name="check" size={13} color={colors.text.inverse} />}
      </View>
    </TouchableOpacity>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.base },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerBtn: { minWidth: 46 },
  skipLabel: { ...typography.label, color: colors.text.secondary, textAlign: 'right' },
  dots: { flexDirection: 'row', gap: spacing.xs },
  dot: {
    width: 18,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
  },
  dotActive: { backgroundColor: colors.accent.default },

  scroll: { padding: spacing['2xl'], paddingBottom: spacing['3xl'], flexGrow: 1 },

  welcome: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  welcomeIcon: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    backgroundColor: colors.accent.dim,
    borderWidth: 1,
    borderColor: colors.accent.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },

  step: { gap: spacing.sm },
  title: { ...typography.h1, color: colors.text.primary, textAlign: 'center' },
  hint: { ...typography.body, color: colors.text.secondary },
  options: { gap: spacing.sm, marginTop: spacing.lg },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  optionSelected: { borderColor: colors.accent.border, backgroundColor: colors.accent.dim },
  optionText: { flex: 1, gap: 2 },
  optionLabel: { ...typography.subheading, color: colors.text.primary },
  optionLabelSelected: { color: colors.accent.default },
  optionHint: { ...typography.bodySmall, color: colors.text.secondary },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: colors.accent.default, borderColor: colors.accent.default },

  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  dayBtn: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtnActive: { borderColor: colors.accent.border, backgroundColor: colors.accent.dim },
  dayNumber: { ...typography.h2, color: colors.text.primary },
  dayNumberActive: { color: colors.accent.default },
  dayUnit: { ...typography.labelSmall, color: colors.text.secondary },
  dayUnitActive: { color: colors.accent.default },

  weekPreview: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.lg },
  weekDay: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.bg.elevated,
    alignItems: 'center',
  },
  weekDayActive: { backgroundColor: colors.accent.dim, borderWidth: 1, borderColor: colors.accent.border },
  weekDayLabel: { ...typography.labelSmall, color: colors.text.tertiary },
  weekDayLabelActive: { color: colors.accent.default },

  loadingBox: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing['3xl'] },

  planCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.accent.dim,
    borderWidth: 1,
    borderColor: colors.accent.border,
    gap: spacing.sm,
  },
  planName: { ...typography.h3, color: colors.text.primary },
  planSubtitle: { ...typography.bodySmall, color: colors.accent.default },
  planDescription: { ...typography.bodySmall, color: colors.text.secondary },

  scheduleCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.sm,
  },
  scheduleTitle: { ...typography.label, color: colors.text.secondary },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  scheduleDay: { ...typography.label, color: colors.accent.default, width: 34 },
  scheduleWorkout: { ...typography.body, color: colors.text.primary, flex: 1 },
  scheduleFooter: { ...typography.bodySmall, color: colors.text.tertiary, marginTop: spacing.xs },

  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    backgroundColor: colors.bg.surface,
  },
});
