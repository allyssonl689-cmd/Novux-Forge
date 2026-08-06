import { Feather } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { useTheme } from '@/theme';
import { typography } from '@/theme';

export default function AppLayout() {
  const { isAuthenticated, initialized } = useAuth();
  const { colors } = useTheme();

  if (!initialized) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

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
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="workouts"
        options={{ title: 'Fichas', tabBarIcon: ({ color }) => <Feather name="clipboard" size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'Histórico', tabBarIcon: ({ color }) => <Feather name="clock" size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="exercises"
        options={{ title: 'Exercícios', tabBarIcon: ({ color }) => <Feather name="book-open" size={22} color={color} /> }}
      />
      {/*
        Rotas sem aba própria. `href: null` tira o botão da barra, mas a barra
        continuaria aparecendo por cima da tela — daí o display: 'none'.
        Treino ativo e onboarding ocupam a tela inteira.
      */}
      <Tabs.Screen
        name="workout"
        options={{ href: null, tabBarStyle: { display: 'none' } }}
      />
      <Tabs.Screen
        name="onboarding"
        options={{ href: null, tabBarStyle: { display: 'none' } }}
      />
      <Tabs.Screen
        name="profile"
        options={{ href: null, tabBarStyle: { display: 'none' } }}
      />
      <Tabs.Screen
        name="settings"
        options={{ href: null, tabBarStyle: { display: 'none' } }}
      />
      <Tabs.Screen name="progress" options={{ href: null }} />
      <Tabs.Screen name="progress-photos" options={{ href: null }} />
    </Tabs>
  );
}
