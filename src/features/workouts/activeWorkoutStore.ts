import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { calcVolume } from '@/lib/utils';
import { DEFAULT_REST_SECONDS } from './workoutService';
import { LastPerformance, seedWeight } from './progression';

export interface SetEntry {
  id: string;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  targetReps: number | null;
  /** Percepção de esforço (1-10) — opcional, não se aplica a séries de aquecimento */
  rpe: number | null;
  completed: boolean;
  isPersonalRecord: boolean;
  isWarmup: boolean;
}

export interface ActiveExercise {
  exerciseId: string;
  exerciseName: string;
  sortOrder: number;
  restSeconds: number;
  notes: string | null;
  /** Última execução registrada — mostrada como referência durante o treino */
  lastPerformance: LastPerformance | null;
  /** true quando a carga inicial foi aumentada em relação à última vez */
  progressionApplied: boolean;
  sets: SetEntry[];
}

/** Exercício da ficha no formato que o store precisa para montar as séries */
export interface StartExerciseInput {
  exerciseId: string;
  exerciseName: string;
  sortOrder: number;
  defaultSets: number;
  defaultReps: number;
  defaultWeightKg: number | null;
  restSeconds: number;
  notes: string | null;
  /** Última execução, buscada antes de iniciar (opcional) */
  lastPerformance?: LastPerformance | null;
}

interface ActiveWorkoutState {
  workoutLogId: string | null;
  workoutId: string | null;
  workoutName: string;
  /** ISO string — Date não sobrevive à serialização do AsyncStorage */
  startedAt: string | null;
  exercises: ActiveExercise[];
  currentExerciseIndex: number;
  isActive: boolean;
  hasHydrated: boolean;

  // Actions
  startWorkout: (params: {
    workoutId: string;
    workoutName: string;
    exercises: StartExerciseInput[];
    userId: string;
  }) => Promise<void>;
  updateSet: (exerciseIdx: number, setIdx: number, data: Partial<SetEntry>) => void;
  completeSet: (exerciseIdx: number, setIdx: number) => Promise<void>;
  uncompleteSet: (exerciseIdx: number, setIdx: number) => void;
  addSet: (exerciseIdx: number) => void;
  removeSet: (exerciseIdx: number, setIdx: number) => void;
  setCurrentExercise: (idx: number) => void;
  finishWorkout: () => Promise<void>;
  discardWorkout: () => Promise<void>;
  setHasHydrated: (value: boolean) => void;
}

function makeSets(count: number, reps: number, weightKg: number | null): SetEntry[] {
  const stamp = Date.now();
  return Array.from({ length: Math.max(1, count) }, (_, i) => ({
    id: `${stamp}-${i}`,
    setNumber: i + 1,
    weightKg,
    reps: null,
    targetReps: reps,
    rpe: null,
    completed: false,
    isPersonalRecord: false,
    isWarmup: false,
  }));
}

/**
 * Regra 4: um set vira PR quando supera a maior carga já registrada para o
 * exercício. Séries de aquecimento não contam.
 */
async function checkPersonalRecord(
  exerciseId: string,
  weightKg: number | null,
): Promise<boolean> {
  if (!weightKg) return false;

  // maybeSingle: sem histórico o retorno é null, não erro
  const { data, error } = await supabase
    .from('set_logs')
    .select('weight_kg, exercise_logs!inner(exercise_id)')
    .eq('exercise_logs.exercise_id', exerciseId)
    .eq('is_warmup', false)
    .not('weight_kg', 'is', null)
    .order('weight_kg', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return false;
  if (!data) return true; // primeira carga registrada = PR
  return weightKg > (data.weight_kg ?? 0);
}

const EMPTY_STATE = {
  workoutLogId: null,
  workoutId: null,
  workoutName: '',
  startedAt: null,
  exercises: [],
  currentExerciseIndex: 0,
  isActive: false,
};

export const useActiveWorkoutStore = create<ActiveWorkoutState>()(
  persist(
    (set, get) => ({
      ...EMPTY_STATE,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      startWorkout: async ({ workoutId, workoutName, exercises, userId }) => {
        // Regra 1: um treino ativo por vez. Sessões pendentes nunca têm séries
        // gravadas (a persistência só acontece no finish), então são descartadas.
        await supabase
          .from('workout_logs')
          .delete()
          .eq('user_id', userId)
          .is('finished_at', null);

        const startedAt = new Date().toISOString();

        const { data, error } = await supabase
          .from('workout_logs')
          .insert({
            user_id: userId,
            workout_id: workoutId,
            name: workoutName, // snapshot do nome (Regra 2)
            started_at: startedAt,
          })
          .select('id')
          .single();

        if (error) throw error;

        set({
          isActive: true,
          workoutLogId: data.id,
          workoutId,
          workoutName,
          startedAt,
          currentExerciseIndex: 0,
          exercises: exercises
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((ex) => {
              const last = ex.lastPerformance ?? null;
              const seed = seedWeight(last, ex.defaultReps, ex.defaultWeightKg);
              return {
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                sortOrder: ex.sortOrder,
                restSeconds: ex.restSeconds ?? DEFAULT_REST_SECONDS,
                notes: ex.notes,
                lastPerformance: last,
                progressionApplied: seed.isProgression,
                sets: makeSets(ex.defaultSets, ex.defaultReps, seed.weightKg),
              };
            }),
        });
      },

      updateSet: (exerciseIdx, setIdx, data) => {
        set((state) => ({
          exercises: state.exercises.map((ex, ei) =>
            ei !== exerciseIdx
              ? ex
              : {
                  ...ex,
                  sets: ex.sets.map((s, si) => (si === setIdx ? { ...s, ...data } : s)),
                },
          ),
        }));
      },

      completeSet: async (exerciseIdx, setIdx) => {
        const state = get();
        const ex = state.exercises[exerciseIdx];
        const target = ex?.sets[setIdx];
        if (!target || target.completed) return;

        // Marca imediatamente — a checagem de PR não deve travar a UI
        set((s) => ({
          exercises: s.exercises.map((e, ei) =>
            ei !== exerciseIdx
              ? e
              : { ...e, sets: e.sets.map((st, si) => (si === setIdx ? { ...st, completed: true } : st)) },
          ),
        }));

        if (target.isWarmup || !target.weightKg) return;

        const isPersonalRecord = await checkPersonalRecord(ex.exerciseId, target.weightKg);
        if (!isPersonalRecord) return;

        set((s) => ({
          exercises: s.exercises.map((e, ei) =>
            ei !== exerciseIdx
              ? e
              : { ...e, sets: e.sets.map((st, si) => (si === setIdx ? { ...st, isPersonalRecord: true } : st)) },
          ),
        }));
      },

      uncompleteSet: (exerciseIdx, setIdx) => {
        set((state) => ({
          exercises: state.exercises.map((ex, ei) =>
            ei !== exerciseIdx
              ? ex
              : {
                  ...ex,
                  sets: ex.sets.map((s, si) =>
                    si === setIdx ? { ...s, completed: false, isPersonalRecord: false } : s,
                  ),
                },
          ),
        }));
      },

      addSet: (exerciseIdx) => {
        set((state) => ({
          exercises: state.exercises.map((ex, ei) => {
            if (ei !== exerciseIdx) return ex;
            const lastSet = ex.sets[ex.sets.length - 1];
            const newSet: SetEntry = {
              id: `${Date.now()}-${ex.sets.length}`,
              setNumber: ex.sets.length + 1,
              weightKg: lastSet?.weightKg ?? null,
              reps: null,
              targetReps: lastSet?.targetReps ?? null,
              rpe: null,
              completed: false,
              isPersonalRecord: false,
              isWarmup: false,
            };
            return { ...ex, sets: [...ex.sets, newSet] };
          }),
        }));
      },

      removeSet: (exerciseIdx, setIdx) => {
        set((state) => ({
          exercises: state.exercises.map((ex, ei) => {
            if (ei !== exerciseIdx) return ex;
            const sets = ex.sets
              .filter((_, si) => si !== setIdx)
              .map((s, i) => ({ ...s, setNumber: i + 1 }));
            return { ...ex, sets };
          }),
        }));
      },

      setCurrentExercise: (idx) => set({ currentExerciseIndex: idx }),

      finishWorkout: async () => {
        const state = get();
        if (!state.workoutLogId || !state.startedAt) return;

        const finishedAt = new Date();
        const durationSecs = Math.max(
          0,
          Math.floor((finishedAt.getTime() - new Date(state.startedAt).getTime()) / 1000),
        );

        let totalVolume = 0;

        for (const ex of state.exercises) {
          const completedSets = ex.sets.filter((s) => s.completed);
          if (completedSets.length === 0) continue;

          const { data: exLog, error: exErr } = await supabase
            .from('exercise_logs')
            .insert({
              workout_log_id: state.workoutLogId,
              exercise_id: ex.exerciseId,
              exercise_name: ex.exerciseName, // snapshot (Regra 2)
              sort_order: ex.sortOrder,
              notes: ex.notes,
            })
            .select('id')
            .single();

          if (exErr || !exLog) continue;

          const setRows = completedSets.map((s) => {
            // Regra 5: séries de aquecimento não somam ao volume
            if (!s.isWarmup) totalVolume += calcVolume(s.weightKg, s.reps);
            return {
              exercise_log_id: exLog.id,
              set_number: s.setNumber,
              weight_kg: s.weightKg,
              reps: s.reps,
              rpe: s.rpe,
              is_warmup: s.isWarmup,
              is_personal_record: s.isPersonalRecord,
              completed_at: finishedAt.toISOString(),
            };
          });

          await supabase.from('set_logs').insert(setRows);
        }

        // Regra 3: duração e volume são consolidados na finalização
        await supabase
          .from('workout_logs')
          .update({
            finished_at: finishedAt.toISOString(),
            duration_secs: durationSecs,
            total_volume_kg: totalVolume,
          })
          .eq('id', state.workoutLogId);

        set(EMPTY_STATE);
      },

      discardWorkout: async () => {
        const { workoutLogId } = get();
        set(EMPTY_STATE);
        if (!workoutLogId) return;
        // Sessão descartada: o log ainda não tem filhos, some por completo
        await supabase.from('workout_logs').delete().eq('id', workoutLogId);
      },
    }),
    {
      name: 'novux-forge:active-workout',
      storage: createJSONStorage(() => AsyncStorage),
      // Só o estado da sessão é persistido — fechar o app no meio do treino
      // não pode custar as séries já registradas.
      partialize: (state) => ({
        workoutLogId: state.workoutLogId,
        workoutId: state.workoutId,
        workoutName: state.workoutName,
        startedAt: state.startedAt,
        exercises: state.exercises,
        currentExerciseIndex: state.currentExerciseIndex,
        isActive: state.isActive,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
