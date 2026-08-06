import type { ExpoConfig } from 'expo/config';

// Cores da marca Novux "Ember" (ver brand/tokens/colors.json)
const BRAND_BG = '#050816';
const BRAND_PRIMARY = '#FF6B2C';

const config: ExpoConfig = {
  name: 'Novux Forge',
  slug: 'novux-forge',
  // Conta EAS (time), não a pessoal — evita ambiguidade de qual conta builda.
  owner: 'novux-forges-team',
  version: '1.0.0',
  scheme: 'novuxforge',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic', // suporta dark e light
  icon: './assets/images/icon.png',
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: BRAND_BG,
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    // Obrigatório para build standalone (EAS Build) — Expo Go não exige,
    // mas um APK instalável precisa de um identificador de pacote fixo.
    package: 'com.novux.forge',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: BRAND_BG,
    },
  },
  web: {
    bundler: 'metro',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-notifications',
      {
        color: BRAND_PRIMARY,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'O Novux Forge usa suas fotos para registrar seu progresso corporal.',
        cameraPermission: 'O Novux Forge usa a câmera para registrar fotos de progresso.',
      },
    ],
  ],
  extra: {
    brandColor: BRAND_PRIMARY,
    supabaseUrl:     process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    rapidApiKey:     process.env.EXPO_PUBLIC_RAPIDAPI_KEY ?? null,
    // Gerado por `eas init` em 2026-08-05 — vincula ao projeto
    // @novux-forges-team/novux-forge no EAS. `app.config.ts` é dinâmico
    // (TS), então o CLI não escreve aqui sozinho; foi copiado do output.
    eas: {
      projectId: 'ac5e55c0-db3b-456c-a7fc-1d1dac3a14e4',
    },
  },
};

export default config;
