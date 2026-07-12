export type WorkoutType =
  | 'Cardio'
  | 'Strength'
  | 'MobilityFlexibility'
  | 'Rehabilitation'
  | 'FullBody'
  | 'UpperBody'
  | 'LowerBody'
  | 'Core'
  | 'Other';

export interface Workout {
  id: string;
  type: WorkoutType;
  /** Naive local wall-clock ISO string (no timezone offset). */
  performedAt: string;
  durationMinutes: number;
  calories: number | null;
  tiredness: number;
  intensity: number;
  notes: string | null;
}

export interface CreateWorkoutRequest {
  type: WorkoutType;
  performedAt: string;
  durationMinutes: number;
  calories?: number | null;
  tiredness: number;
  notes?: string | null;
}
