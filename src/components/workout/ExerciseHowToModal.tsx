import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Dimensions, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseMedia } from './ExerciseMedia';
import { Skeleton, SkeletonGroup } from '@/components/ui';
import { useExercise } from '@/features/exercises/useExercises';
import { videoUrlFor } from '@/features/exercises/exerciseService';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';

interface Props {
  /** id do exercício a mostrar; null = modal fechado */
  exerciseId: string | null;
  onClose: () => void;
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
 * Versão condensada do "como fazer" (a tela completa vive em
 * app/(app)/exercises/[id].tsx): mídia + vídeo + antes de começar +
 * passo a passo. Pensada para abrir sem sair de onde o usuário está —
 * revisando a ficha ou no meio do treino, na academia.
 */
export function ExerciseHowToModal({ exerciseId, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data: exercise, isLoading, isError } = useExercise(exerciseId ?? '');

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
  });
