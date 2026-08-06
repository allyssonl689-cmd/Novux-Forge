import { Image } from 'expo-image';
import React from 'react';
import { ImageStyle, StyleProp } from 'react-native';
import { useTheme } from '@/theme';

const LOGO_DARK = require('../../../assets/images/icon.png');
const LOGO_LIGHT = require('../../../assets/images/icon-light.png');

interface Props {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/** Marca da Novux — alterna a variante conforme o tema (fundo dark/light) */
export function BrandLogo({ size = 72, style }: Props) {
  const { mode } = useTheme();
  return (
    <Image
      source={mode === 'dark' ? LOGO_DARK : LOGO_LIGHT}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
    />
  );
}
