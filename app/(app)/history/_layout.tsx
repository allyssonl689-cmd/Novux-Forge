import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '@/theme';

export default function HistoryLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg.base } }} />;
}
