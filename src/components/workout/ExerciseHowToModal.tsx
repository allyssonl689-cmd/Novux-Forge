import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseMedia } from './ExerciseMedia';
import { Skeleton, SkeletonGroup } from '@/components/ui';
import { useExercise, useExerciseAlternatives } from '@/features/exercises/useExercises';
import { videoUrlFor } from '@/features/exercises/exerciseService';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

interface Props {
  /** id do exercício a mostrar; null = modal fechado */
  exerciseId: string | null;
  onClose: () => void;
}

function Badge({ label }: { label: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeLabel}>{label}</Text>
    </View>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MEDIA_HEIGHT = 200;
const MEDIA_WIDTH = SCREEN_WIDTH - spacing.lg * 2;

function Section({ title, icon, children }: { title: string; icon: keyof typeof Feather.glyphMap; children: React.ReactNode }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Feather name={icon} size={15} color={colors.text.secondary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

/**
 * Mesmo conteúdo de app/(app)/exercises/[id].tsx, em modal — para não sair
 * de onde o usuário está (editor de ficha ou treino ativo, na academia).
 */
export function ExerciseHowToModal({ exerciseId, onClose }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data: exercise, isLoading, isError } = useExercise(exerciseId ?? '');
  const { data: alternatives = [] } = useExerciseAlternatives(exercise);

  function goToAlternative(id: string) {
    onClose();
    router.push(`/(app)/exercises/${id}`);
  }

  return (
    <Modal
      visible={exerciseId !== null}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {exercise?.name ?? 'Como fazer'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <Feather name="x" size={22} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <SkeletonGroup gap={spacing.md}>
              <Skeleton height={MEDIA_HEIGHT} radius={radius.lg} />
              <Skeleton height={40} radius={radius.md} />
              <Skeleton width="70%" height={16} />
              <Skeleton height={16} />
              <Skeleton width="85%" height={16} />
            </SkeletonGroup>
          ) : isError || !exercise ? (
            <View style={styles.center}>
              <Feather name="alert-circle" size={28} color={colors.feedback.danger} />
              <Text style={styles.errorText}>Não foi possível carregar o exercício.</Text>
            </View>
          ) : (
            <>
              {exercise.free_db_id ? (
                <ExerciseMedia
                  slug={exercise.slug}
                  freeDbId={exercise.free_db_id}
                  rapidApiId={exercise.rapid_api_id ?? undefined}
                  width={MEDIA_WIDTH}
                  height={MEDIA_HEIGHT}
                />
              ) : (
                <View style={[styles.mediaPlaceholder, { width: MEDIA_WIDTH, height: MEDIA_HEIGHT }]}>
                  <Feather name="image" size={28} color={colors.text.tertiary} />
                </View>
              )}

              <TouchableOpacity
                style={styles.videoBtn}
                onPress={() => Linking.openURL(videoUrlFor(exercise))}
                activeOpacity={0.8}
              >
                <Feather name="play-circle" size={18} color={colors.accent.default} />
                <Text style={styles.videoLabel}>Ver vídeo de execução</Text>
                <Feather name="external-link" size={14} color={colors.text.tertiary} />
              </TouchableOpacity>

              {exercise.setup_steps?.length > 0 && (
                <Section title="Antes de começar" icon="sliders">
                  <View style={styles.list}>
                    {exercise.setup_steps.map((step, i) => (
                      <View key={i} style={styles.listItem}>
                        <Feather name="chevron-right" size={14} color={colors.text.tertiary} />
                        <Text style={styles.listText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                </Section>
              )}

              {exercise.instructions.length > 0 && (
                <Section title="Execução" icon="list">
                  <View style={styles.list}>
                    {exercise.instructions.map((step, i) => (
                      <View key={i} style={styles.step}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>{i + 1}</Text>
                        </View>
                        <Text style={styles.listText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                </Section>
              )}

              {(exercise.breathing || exercise.tempo) && (
                <View style={styles.metaRow}>
                  {exercise.breathing && (
                    <View style={styles.metaCard}>
                      <View style={styles.sectionHeader}>
                        <Feather name="wind" size={14} color={colors.accent.default} />
                        <Text style={styles.metaTitle}>Respiração</Text>
                      </View>
                      <Text style={styles.metaText}>{exercise.breathing}</Text>
                    </View>
                  )}
                  {exercise.tempo && (
                    <View style={styles.metaCard}>
                      <View style={styles.sectionHeader}>
                        <Feather name="clock" size={14} color={colors.accent.default} />
                        <Text style={styles.metaTitle}>Cadência</Text>
                      </View>
                      <Text style={styles.metaText}>{exercise.tempo}</Text>
                    </View>
                  )}
                </View>
              )}

              {exercise.common_mistakes?.length > 0 && (
                <Section title="Erros comuns" icon="alert-triangle">
                  <View style={styles.list}>
                    {exercise.common_mistakes.map((m, i) => (
                      <View key={i} style={styles.listItem}>
                        <Feather name="x" size={14} color={colors.feedback.danger} />
                        <Text style={styles.listText}>{m}</Text>
                      </View>
                    ))}
                  </View>
                </Section>
              )}

              {exercise.tips.length > 0 && (
                <Section title="Dicas" icon="check-circle">
                  <View style={styles.list}>
                    {exercise.tips.map((tip, i) => (
                      <View key={i} style={styles.listItem}>
                        <Feather name="check" size={14} color={colors.accent.default} />
                        <Text style={styles.listText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                </Section>
              )}

              {exercise.safety_notes && (
                <View style={styles.safetyCard}>
                  <View style={styles.sectionHeader}>
                    <Feather name="shield" size={15} color={colors.amber.default} />
                    <Text style={styles.safetyTitle}>Segurança</Text>
                  </View>
                  <Text style={styles.safetyText}>{exercise.safety_notes}</Text>
                </View>
              )}

              {alternatives.length > 0 && (
                <Section title="Se o aparelho estiver ocupado" icon="repeat">
                  <View style={styles.list}>
                    {alternatives.map((alt) => (
                      <TouchableOpacity
                        key={alt.id}
                        style={styles.altRow}
                        onPress={() => goToAlternative(alt.id)}
                        activeOpacity={0.75}
                      >
                        <View style={styles.listItem}>
                          <Text style={styles.listText} numberOfLines={1}>{alt.name}</Text>
                        </View>
                        <Feather name="chevron-right" size={16} color={colors.text.tertiary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </Section>
              )}

              {exercise.muscles_worked.length > 0 && (
                <Section title="Músculos secundários" icon="activity">
                  <View style={styles.badgesRow}>
                    {exercise.muscles_worked.map((m) => (
                      <Badge key={m} label={m} />
                    ))}
                  </View>
                </Section>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
      borderBottomColor: colors.border.subtle,
      gap: spacing.md,
    },
    headerTitle: { ...typography.h3, color: colors.text.primary, flex: 1 },
    closeBtn: { padding: spacing.xs },
    scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing['3xl'] },
    center: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingVertical: spacing['4xl'] },
    errorText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
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
      backgroundColor: colors.accent.dim,
      borderColor: colors.accent.border,
      borderWidth: 1,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    videoLabel: { ...typography.body, color: colors.accent.default, flex: 1 },
    section: { gap: spacing.sm },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    sectionTitle: { ...typography.subheading, color: colors.text.primary },
    list: { gap: spacing.sm },
    listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
    listText: { ...typography.body, color: colors.text.secondary, flex: 1 },
    step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    stepNumber: {
      width: 20,
      height: 20,
      borderRadius: radius.full,
      backgroundColor: colors.accent.dim,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    stepNumberText: { ...typography.labelSmall, color: colors.accent.default },

    metaRow: { flexDirection: 'row', gap: spacing.sm },
    metaCard: {
      flex: 1,
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.bg.surface,
      borderWidth: 1,
      borderColor: colors.border.default,
      gap: spacing.sm,
    },
    metaTitle: { ...typography.label, color: colors.text.secondary },
    metaText: { ...typography.bodySmall, color: colors.text.primary },

    safetyCard: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: colors.amber.dim,
      borderWidth: 1,
      borderColor: colors.amber.border,
      gap: spacing.sm,
    },
    safetyTitle: { ...typography.label, color: colors.amber.default },
    safetyText: { ...typography.body, color: colors.text.secondary },

    altRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },

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
  });
