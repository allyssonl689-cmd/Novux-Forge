import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Novux Forge',
  slug: 'novux-forge',
  version: '1.0.0',
  scheme: 'novuxforge',
  web: { bundler: 'metro' },
  plugins: ['expo-router'],
  extra: {
    supabaseUrl:     process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    rapidApiKey:     process.env.EXPO_PUBLIC_RAPIDAPI_KEY ?? null,
  },
};

export default config;
