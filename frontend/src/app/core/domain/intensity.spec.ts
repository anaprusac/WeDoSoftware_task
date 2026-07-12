import { describe, expect, it } from 'vitest';
import { calculateIntensity, durationModifier, genderModifier, WORKOUT_TYPES } from './intensity';

// Mirrors WeDoSoftware.Tests/Domain/IntensityCalculatorTests.cs — this is only a client-side
// preview of the server's authoritative formula, so the two must stay in lockstep.
describe('intensity', () => {
  it('lists all nine workout types', () => {
    expect(WORKOUT_TYPES).toHaveLength(9);
    expect(WORKOUT_TYPES).toContain('Cardio');
    expect(WORKOUT_TYPES).toContain('Other');
  });

  it.each([
    [0, -1],
    [19, -1],
    [20, 0],
    [39, 0],
    [40, 0.5],
    [59, 0.5],
    [60, 1],
    [89, 1],
    [90, 2],
    [149, 2],
    [150, 3],
    [300, 3],
  ])('durationModifier(%i) === %f', (minutes, expected) => {
    expect(durationModifier(minutes)).toBe(expected);
  });

  it('genderModifier adds half a point for female, nothing for male', () => {
    expect(genderModifier('Male')).toBe(0);
    expect(genderModifier('Female')).toBe(0.5);
  });

  it('combines base + duration + gender', () => {
    // Cardio(6) + 45min(+0.5) + Female(+0.5) = 7.0
    expect(calculateIntensity('Cardio', 45, 'Female')).toBe(7.0);
  });

  it('clamps to a minimum of 1', () => {
    // Rehabilitation(1) + <20min(-1) + Male(0) = 0 -> clamped to 1
    expect(calculateIntensity('Rehabilitation', 10, 'Male')).toBe(1);
  });

  it('clamps to a maximum of 10', () => {
    // Strength(7) + >150min(+3) + Female(+0.5) = 10.5 -> clamped to 10
    expect(calculateIntensity('Strength', 200, 'Female')).toBe(10);
  });
});
