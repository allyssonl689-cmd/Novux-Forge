import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '@/theme';

export default function ExercisesLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg.base } }} />;
}
