import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatTime } from '@/lib/utils';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/palette';
import { fonts } from '@/theme';

interface Props {
  seconds: number;
}

export function WorkoutTimer({ seconds }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{formatTime(seconds)}</Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { alignItems: 'center' },
    // Cronômetro em Outfit (papel numérico da marca)
    time: {
      fontFamily: fonts.numExtraBold,
      fontSize: 30,
      lineHeight: 34,
      color: colors.accent.default,
      letterSpacing: 1,
    },
  });
