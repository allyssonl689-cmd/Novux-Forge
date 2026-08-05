import { useAuthStore } from './authStore';
import { requestPasswordReset, signIn, signOut, signUp } from './authService';

export function useAuth() {
  const { session, user, initialized } = useAuthStore();

  return {
    session,
    user,
    initialized,
    isAuthenticated: !!session,
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
  };
}
