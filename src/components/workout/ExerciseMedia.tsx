import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@/theme';
import { resolveExerciseMedia, MediaResult } from '@/lib/mediaResolver';

interface Props {
  slug: string;
  freeDbId: string;
  rapidApiId?: string;
  width?: number;
  height?: number;
}

export function ExerciseMedia({ slug, freeDbId, rapidApiId, width = 320, height = 220 }: Props) {
  const [media, setMedia] = useState<MediaResult | null>(null);

  useEffect(() => {
    resolveExerciseMedia(slug, freeDbId, rapidApiId).then(setMedia);
  }, [slug, freeDbId, rapidApiId]);

  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={{ uri: media?.uri }}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
        placeholder={{ color: colors.bg.elevated }}
        transition={300}
      />
      {__DEV__ && media && <View style={styles.badge} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.bg.elevated,
  },
  image: { width: '100%', height: '100%' },
  badge: { position: 'absolute', bottom: 8, right: 8 },
});
