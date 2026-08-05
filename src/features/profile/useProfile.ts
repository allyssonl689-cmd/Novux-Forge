import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ONBOARDING_KEY } from '@/features/plan/useWeeklyPlan';
import { fetchProfile, resetOnboarding, updateProfile, UserProfile } from './profileService';

export const PROFILE_KEY = ['profile'] as const;

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: fetchProfile,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Pick<UserProfile, 'display_name' | 'body_weight'>>) =>
      updateProfile(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

export function useResetOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resetOnboarding,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
      qc.invalidateQueries({ queryKey: ONBOARDING_KEY });
    },
  });
}
