import type { ExpoConfig } from 'expo/config';

// Cores da marca Novux "Ember" (ver brand/tokens/colors.json)
const BRAND_BG = '#050816';
const BRAND_PRIMARY = '#FF6B2C';

const config: ExpoConfig = {
  name: 'Novux Forge',
  slug: 'novux-forge',
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
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: BRAND_BG,
    },
  },
  web: {
    bundler: 'metro',
    favicon: './assets/images/favicon.png',
  },
  plugins: ['expo-router'],
  extra: {
    brandColor: BRAND_PRIMARY,
    supabaseUrl:     process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    rapidApiKey:     process.env.EXPO_PUBLIC_RAPIDAPI_KEY ?? null,
  },
};

export default config;
