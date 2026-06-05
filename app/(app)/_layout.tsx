import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { colors, typography } from '@/theme';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg.surface,
          borderTopColor: colors.border.default,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor:   colors.accent.default,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: { ...typography.labelSmall, marginBottom: 4 },
      }}
    >
      <Tabs.Screen
        name="history"
        options={{ title: 'Histórico', tabBarIcon: ({ color }) => <Feather name="clock" size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="exercises"
        options={{ title: 'Exercícios', tabBarIcon: ({ color }) => <Feather name="book-open" size={22} color={color} /> }}
      />
    </Tabs>
  );
}
