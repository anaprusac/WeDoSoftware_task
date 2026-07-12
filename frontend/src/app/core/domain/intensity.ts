import { Gender } from '../models/user.model';
import { WorkoutType } from '../models/workout.model';

/**
 * Client-side mirror of the server's intensity formula, used ONLY for the live preview on the
 * add-workout form. The server recomputes and stores the authoritative value on save. These constants
 * must stay in sync with WeDoSoftware.Domain.Services.IntensityCalculator.
 */
const BASE_POINTS: Record<WorkoutType, number> = {
  Cardio: 6,
  Strength: 7,
  MobilityFlexibility: 3,
  Rehabilitation: 1,
  FullBody: 7,
  UpperBody: 6,
  LowerBody: 6,
  Core: 6,
  Other: 5,
};

/** Stable list of workout types (ordering here is irrelevant — the UI sorts by localized label). */
export const WORKOUT_TYPES = Object.keys(BASE_POINTS) as WorkoutType[];

export function durationModifier(minutes: number): number {
  if (minutes < 20) return -1;
  if (minutes < 40) return 0;
  if (minutes < 60) return 0.5;
  if (minutes < 90) return 1;
  if (minutes < 150) return 2;
  return 3;
}

export function genderModifier(gender: Gender): number {
  return gender === 'Female' ? 0.5 : 0;
}

export function calculateIntensity(type: WorkoutType, minutes: number, gender: Gender): number {
  const raw = BASE_POINTS[type] + durationModifier(minutes) + genderModifier(gender);
  return Math.min(10, Math.max(1, Math.round(raw * 10) / 10));
}
