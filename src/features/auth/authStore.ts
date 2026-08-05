import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  initialized: boolean;

  setSession: (session: Session | null) => void;
  initialize: () => () => void; // retorna a função de cleanup do listener
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initialized: false,

  setSession: (session) =>
    set({ session, user: session?.user ?? null }),

  initialize: () => {
    // Carrega a sessão existente no storage
    supabase.auth.getSession().then(({ data }) => {
      set({
        session: data.session,
        user: data.session?.user ?? null,
        initialized: true,
      });
    });

    // Listener de mudanças de auth (login, logout, refresh de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        set({
          session,
          user: session?.user ?? null,
          initialized: true,
        });
      },
    );

    return () => subscription.unsubscribe();
  },
}));
