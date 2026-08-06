import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ONBOARDING_KEY } from '@/features/plan/useWeeklyPlan';
import { fetchProfile, resetOnboarding, updateProfile, UserProfile } from './profileService';
import { resetAccountData } from './resetAccountService';
import { deleteAccountPermanently } from './deleteAccountService';

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

/** Apaga histórico + fichas (ver resetAccountService) e invalida tudo — os dados voltam ao estado de conta nova */
export function useResetAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resetAccountData,
    onSuccess: () => qc.invalidateQueries(),
  });
}

/** Exclusão de conta (LGPD) — irreversível, via Edge Function. Ver deleteAccountService. */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccountPermanently,
  });
}
