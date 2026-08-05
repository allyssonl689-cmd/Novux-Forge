import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchOnboardingProfile,
  fetchWeeklyPlan,
  saveOnboardingAnswers,
  setWeekdayWorkout,
  setWeeklyPlan,
  skipOnboarding,
} from './weeklyPlanService';
import { OnboardingAnswers } from './recommendation';

export const WEEKLY_PLAN_KEY = ['weekly-plan'] as const;
export const ONBOARDING_KEY = ['onboarding-profile'] as const;

export function useWeeklyPlan() {
  return useQuery({
    queryKey: WEEKLY_PLAN_KEY,
    queryFn: fetchWeeklyPlan,
  });
}

export function useOnboardingProfile() {
  return useQuery({
    queryKey: ONBOARDING_KEY,
    queryFn: fetchOnboardingProfile,
  });
}

export function useSetWeeklyPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setWeeklyPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: WEEKLY_PLAN_KEY }),
  });
}

export function useSetWeekdayWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ weekday, workoutId }: { weekday: number; workoutId: string | null }) =>
      setWeekdayWorkout(weekday, workoutId),
    onSuccess: () => qc.invalidateQueries({ queryKey: WEEKLY_PLAN_KEY }),
  });
}

export function useSaveOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (answers: OnboardingAnswers) => saveOnboardingAnswers(answers),
    onSuccess: () => qc.invalidateQueries({ queryKey: ONBOARDING_KEY }),
  });
}

export function useSkipOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: skipOnboarding,
    onSuccess: () => qc.invalidateQueries({ queryKey: ONBOARDING_KEY }),
  });
}
