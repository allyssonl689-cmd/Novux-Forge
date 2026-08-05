import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { radius as radiusScale } from '@/theme';

interface Props {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

/**
 * Placeholder de carregamento — um bloco que pulsa em opacidade.
 * Componha vários lado a lado/em coluna para espelhar o formato real do
 * conteúdo (ex.: uma linha larga pro título + uma curta pro subtítulo).
 */
export function Skeleton({ width = '100%', height = 16, radius = radiusScale.sm, style }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.base, { width, height, borderRadius: radius, opacity }, style]}
    />
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    base: {
      backgroundColor: colors.bg.elevated,
    },
  });

/** Empilha skeletons com o espaçamento padrão — atalho para listas. */
export function SkeletonGroup({ children, gap = 8 }: { children: React.ReactNode; gap?: number }) {
  return <View style={{ gap }}>{children}</View>;
}
