export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  body_weight: number | null;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  muscle_group: string;
  muscles_worked: string[];
  equipment: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  tips: string[];
  is_public: boolean;
  created_by: string | null;
  free_db_id: string | null;
  rapid_api_id: string | null;
  created_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sort_order: number;
  default_sets: number;
  default_reps: number;
  default_weight_kg: number | null;
  rest_seconds: number;
  notes: string | null;
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_id: string | null;
  name: string;
  started_at: string;
  finished_at: string | null;
  duration_secs: number | null;
  total_volume_kg: number;
  notes: string | null;
  created_at: string;
}

export interface ExerciseLog {
  id: string;
  workout_log_id: string;
  exercise_id: string;
  exercise_name: string;
  sort_order: number;
  notes: string | null;
  created_at: string;
}

export interface SetLog {
  id: string;
  exercise_log_id: string;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
  duration_secs: number | null;
  rpe: number | null;
  is_warmup: boolean;
  is_personal_record: boolean;
  completed_at: string;
}
