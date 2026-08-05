import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius, spacing, typography } from '@/theme';
import { resolveExerciseMedia, MediaResult } from '@/lib/mediaResolver';

interface Props {
  slug: string;
  freeDbId: string;
  rapidApiId?: string;
  width?: number;
  height?: number;
}

/** Intervalo entre as duas poses (ms) — rápido o bastante para dar noção do movimento */
const FRAME_INTERVAL = 850;

export function ExerciseMedia({ slug, freeDbId, rapidApiId, width = 320, height = 220 }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [media, setMedia] = useState<MediaResult | null>(null);
  const [frameIdx, setFrameIdx] = useState(0);
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    let active = true;
    setMedia(null);
    setCanAnimate(false);
    setFrameIdx(0);
    resolveExerciseMedia(slug, freeDbId, rapidApiId).then((m) => {
      if (active) setMedia(m);
    });
    return () => {
      active = false;
    };
  }, [slug, freeDbId, rapidApiId]);

  const frames = media?.frames && media.frames.length > 1 ? media.frames : null;

  // Só anima se a 2ª pose realmente existir (nem todo exercício tem)
  useEffect(() => {
    if (!frames) return;
    let active = true;
    Image.prefetch(frames[1]).then((ok) => {
      if (active) setCanAnimate(!!ok);
    });
    return () => {
      active = false;
    };
  }, [frames?.[1]]);

  // Alterna início ↔ fim; o cross-fade fica por conta do `transition` do expo-image
  useEffect(() => {
    if (!frames || !canAnimate) return;
    const id = setInterval(() => setFrameIdx((i) => (i + 1) % 2), FRAME_INTERVAL);
    return () => clearInterval(id);
  }, [frames, canAnimate]);

  const currentUri =
    frames && canAnimate ? frames[frameIdx] : media?.uri;

  const isGif = media?.type === 'gif';
  const showsAnimatedPoses = !!frames && canAnimate;

  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={currentUri ? { uri: currentUri } : undefined}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={FRAME_INTERVAL / 2}
      />

      {/* Selo de demonstração animada */}
      {(isGif || showsAnimatedPoses) && (
        <View style={styles.badge}>
          <Feather name="play" size={10} color={colors.text.primary} />
          <Text style={styles.badgeLabel}>Demonstração</Text>
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: colors.bg.elevated,
    },
    image: { width: '100%', height: '100%' },
    badge: {
      position: 'absolute',
      bottom: spacing.sm,
      left: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.full,
      backgroundColor: 'rgba(5,8,22,0.85)',
    },
    badgeLabel: { ...typography.labelSmall, color: '#F2F4F8' },
  });
