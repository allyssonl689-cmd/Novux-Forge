import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import { Syne_700Bold, Syne_800ExtraBold } from '@expo-google-fonts/syne';
import {
  Outfit_400Regular,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import { FiraCode_500Medium } from '@expo-google-fonts/fira-code';
import { useFonts } from 'expo-font';
import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/authStore';
import { useWorkoutReminders } from '@/features/notifications/useWorkoutReminders';
import { queryClient } from '@/lib/queryClient';
import { useTheme } from '@/theme';
import { ConfirmDialogProvider, ErrorBoundary } from '@/components/ui';

SplashScreen.preventAutoHideAsync();

/** Só existe para manter o hook ativo durante toda a sessão autenticada */
function WorkoutReminderScheduler() {
  useWorkoutReminders();
  return null;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { initialized, session, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Inicializa o listener de auth uma única vez
  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, []);

  // Redirect automático baseado na sessão
  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (session && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [initialized, session, segments]);

  return (
    <>
      {session && <WorkoutReminderScheduler />}
      {children}
    </>
  );
}

export default function RootLayout() {
  const { colors, mode } = useTheme();

  const [fontsLoaded] = useFonts({
    // Poppins — UI
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    // Syne — marca
    Syne_700Bold,
    Syne_800ExtraBold,
    // Outfit — números/KPI
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    // Fira Code — mono
    FiraCode_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} backgroundColor={colors.bg.base} />
      <ErrorBoundary>
        <ConfirmDialogProvider>
          <AuthGate>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg.base } }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
            </Stack>
          </AuthGate>
        </ConfirmDialogProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
