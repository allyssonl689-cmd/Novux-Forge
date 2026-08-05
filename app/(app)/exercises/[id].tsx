import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeScreen } from '@/components/layout';
import { ScreenHeader } from '@/components/layout';
import { ExerciseMedia } from '@/components/workout';
import { useExercise, useExerciseAlternatives } from '@/features/exercises/useExercises';
import { Exercise } from '@/types/workout';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { fonts, radius, spacing, typography } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MEDIA_HEIGHT = 240;

function difficultyColor(colors: ThemeColors, d: Exercise['difficulty']): string {
  if (d === 'beginner') return colors.feedback.success;
  if (d === 'advanced') return colors.feedback.danger;
  return colors.amber.default;
}

const DIFFICULTY_LABEL: Record<Exercise['difficulty'], string> = {
  beginner:     'Iniciante',
  intermediate: 'Intermediário',
  advanced:     'Avançado',
};

/** Sem vídeo curado, abre a busca no YouTube — melhor que um link quebrado */
function videoUrlFor(exercise: Exercise): string {
  if (exercise.video_url) return exercise.video_url;
  const query = encodeURIComponent(`${exercise.name} execução correta`);
  return `https://www.youtube.com/results?search_query=${query}`;
}

function Badge({ label, color }: { label: string; color?: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[styles.badge, color ? { borderColor: `${color}40` } : {}]}>
      <Text style={[styles.badgeLabel, color ? { color } : {}]}>{label}</Text>
    </View>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: keyof typeof Feather.glyphMap;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon && <Feather name={icon} size={16} color={colors.text.secondary} />}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data: exercise, isLoading, isError } = useExercise(id ?? '');
  const { data: alternatives = [] } = useExerciseAlternatives(exercise);

  if (isLoading) {
    return (
      <SafeScreen>
        <ScreenHeader title="Exercício" showBack />
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent.default} size="large" />
        </View>
      </SafeScreen>
    );
  }

  if (isError || !exercise) {
    return (
      <SafeScreen>
        <ScreenHeader title="Exercício" showBack />
        <View style={styles.center}>
          <Feather name="alert-circle" size={32} color={colors.feedback.danger} />
          <Text style={styles.errorText}>Exercício não encontrado</Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <ScreenHeader
        title={exercise.name}
        showBack
        right={
          <TouchableOpacity
            onPress={() => router.push('/(app)/exercises/glossary')}
            hitSlop={8}
            style={styles.glossaryBtn}
          >
            <Feather name="help-circle" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Mídia instrutiva */}
        {exercise.free_db_id ? (
          <ExerciseMedia
            slug={exercise.slug}
            freeDbId={exercise.free_db_id}
            rapidApiId={exercise.rapid_api_id ?? undefined}
            width={SCREEN_WIDTH - spacing['2xl'] * 2}
            height={MEDIA_HEIGHT}
          />
        ) : (
          <View
            style={[
              styles.mediaPlaceholder,
              { width: SCREEN_WIDTH - spacing['2xl'] * 2, height: MEDIA_HEIGHT },
            ]}
          >
            <Feather name="image" size={32} color={colors.text.tertiary} />
          </View>
        )}

        {/* Vídeo de execução */}
        <TouchableOpacity
          style={styles.videoBtn}
          onPress={() => Linking.openURL(videoUrlFor(exercise))}
          activeOpacity={0.8}
        >
          <Feather name="play-circle" size={18} color={colors.accent.default} />
          <Text style={styles.videoLabel}>Ver vídeo de execução</Text>
          <Feather name="external-link" size={14} color={colors.text.tertiary} />
        </TouchableOpacity>

        {/* Classificação */}
        <View style={styles.badgesRow}>
          <Badge label={exercise.muscle_group} color={colors.accent.default} />
          <Badge label={exercise.equipment} />
          <Badge label={exercise.category} />
          <Badge
            label={DIFFICULTY_LABEL[exercise.difficulty as Exercise['difficulty']] ?? exercise.difficulty}
            color={difficultyColor(colors, exercise.difficulty as Exercise['difficulty'])}
          />
        </View>

        {/* Antes de começar */}
        {exercise.setup_steps?.length > 0 && (
          <Section title="Antes de começar" icon="sliders">
            <View style={styles.setupList}>
              {exercise.setup_steps.map((s, i) => (
                <View key={i} style={styles.setupItem}>
                  <Feather name="chevron-right" size={14} color={colors.text.tertiary} style={styles.itemIcon} />
                  <Text style={styles.setupText}>{s}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Passo a passo */}
        {exercise.instructions.length > 0 && (
          <Section title="Execução" icon="list">
            <View style={styles.stepsList}>
              {exercise.instructions.map((step: string, i: number) => (
                <View key={i} style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Respiração e cadência */}
        {(exercise.breathing || exercise.tempo) && (
          <View style={styles.metaRow}>
            {exercise.breathing && (
              <View style={styles.metaCard}>
                <View style={styles.metaHeader}>
                  <Feather name="wind" size={14} color={colors.accent.default} />
                  <Text style={styles.metaTitle}>Respiração</Text>
                </View>
                <Text style={styles.metaText}>{exercise.breathing}</Text>
              </View>
            )}
            {exercise.tempo && (
              <View style={styles.metaCard}>
                <View style={styles.metaHeader}>
                  <Feather name="clock" size={14} color={colors.accent.default} />
                  <Text style={styles.metaTitle}>Cadência</Text>
                </View>
                <Text style={styles.metaText}>{exercise.tempo}</Text>
              </View>
            )}
          </View>
        )}

        {/* Erros comuns */}
        {exercise.common_mistakes?.length > 0 && (
          <Section title="Erros comuns" icon="alert-triangle">
            <View style={styles.mistakesList}>
              {exercise.common_mistakes.map((m, i) => (
                <View key={i} style={styles.mistake}>
                  <Feather name="x" size={14} color={colors.feedback.danger} style={styles.itemIcon} />
                  <Text style={styles.mistakeText}>{m}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Dicas */}
        {exercise.tips.length > 0 && (
          <Section title="Dicas" icon="check-circle">
            <View style={styles.tipsList}>
              {exercise.tips.map((tip: string, i: number) => (
                <View key={i} style={styles.tip}>
                  <Feather name="check" size={14} color={colors.accent.default} style={styles.itemIcon} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Segurança */}
        {exercise.safety_notes && (
          <View style={styles.safetyCard}>
            <View style={styles.safetyHeader}>
              <Feather name="shield" size={15} color={colors.amber.default} />
              <Text style={styles.safetyTitle}>Segurança</Text>
            </View>
            <Text style={styles.safetyText}>{exercise.safety_notes}</Text>
          </View>
        )}

        {/* Alternativas */}
        {alternatives.length > 0 && (
          <Section title="Se o aparelho estiver ocupado" icon="repeat">
            <View style={styles.altList}>
              {alternatives.map((alt) => (
                <TouchableOpacity
                  key={alt.id}
                  style={styles.altRow}
                  onPress={() => router.push(`/(app)/exercises/${alt.id}`)}
                  activeOpacity={0.75}
                >
                  <View style={styles.altText}>
                    <Text style={styles.altName} numberOfLines={1}>{alt.name}</Text>
                    <Text style={styles.altMeta}>{alt.equipment}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.text.tertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </Section>
        )}

        {/* Músculos secundários */}
        {exercise.muscles_worked.length > 0 && (
          <Section title="Músculos secundários" icon="activity">
            <View style={styles.badgesRow}>
              {exercise.muscles_worked.map((m: string) => (
                <Badge key={m} label={m} />
              ))}
            </View>
          </Section>
        )}

        {/* Glossário */}
        <TouchableOpacity
          style={styles.glossaryLink}
          onPress={() => router.push('/(app)/exercises/glossary')}
        >
          <Feather name="book-open" size={15} color={colors.text.secondary} />
          <Text style={styles.glossaryLinkText}>
            Não entendeu algum termo? Veja o glossário
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  errorText: { ...typography.body, color: colors.text.secondary },

  glossaryBtn: { width: 38, alignItems: 'center' },

  // Mídia
  mediaPlaceholder: {
    borderRadius: radius.lg,
    backgroundColor: colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },

  videoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.accent.dim,
    borderWidth: 1,
    borderColor: colors.accent.border,
  },
  videoLabel: { ...typography.label, color: colors.accent.default, flex: 1 },

  // Badges
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  badgeLabel: { ...typography.label, color: colors.text.secondary },

  // Seções
  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.text.primary },

  itemIcon: { marginTop: 3, flexShrink: 0 },

  // Antes de começar
  setupList: { gap: spacing.sm },
  setupItem: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  setupText: { ...typography.body, color: colors.text.secondary, flex: 1 },

  // Passos
  stepsList: { gap: spacing.md },
  step: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.accent.dim,
    borderWidth: 1,
    borderColor: colors.accent.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumberText: {
    ...typography.labelSmall,
    color: colors.accent.default,
    fontFamily: fonts.numBold,
  },
  stepText: { ...typography.body, color: colors.text.primary, flex: 1 },

  // Respiração e cadência
  metaRow: { flexDirection: 'row', gap: spacing.sm },
  metaCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.sm,
  },
  metaHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaTitle: { ...typography.label, color: colors.text.secondary },
  metaText: { ...typography.bodySmall, color: colors.text.primary },

  // Erros comuns
  mistakesList: { gap: spacing.sm },
  mistake: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  mistakeText: { ...typography.body, color: colors.text.secondary, flex: 1 },

  // Dicas
  tipsList: { gap: spacing.sm },
  tip: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  tipText: { ...typography.body, color: colors.text.secondary, flex: 1 },

  // Segurança
  safetyCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.amber.dim,
    borderWidth: 1,
    borderColor: colors.amber.border,
    gap: spacing.sm,
  },
  safetyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  safetyTitle: { ...typography.label, color: colors.amber.default },
  safetyText: { ...typography.body, color: colors.text.secondary },

  // Alternativas
  altList: { gap: spacing.sm },
  altRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  altText: { flex: 1, gap: 2 },
  altName: { ...typography.body, color: colors.text.primary },
  altMeta: { ...typography.bodySmall, color: colors.text.tertiary },

  // Glossário
  glossaryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
  },
  glossaryLinkText: { ...typography.bodySmall, color: colors.text.secondary },
});
