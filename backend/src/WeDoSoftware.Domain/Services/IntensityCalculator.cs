using WeDoSoftware.Domain.Enums;

namespace WeDoSoftware.Domain.Services;

/// <summary>
/// Pure, framework-free calculation of a workout's intensity on a 1–10 scale.
/// <para>
/// intensity = clamp(basePoints(type) + durationModifier(minutes) + genderModifier(gender), 1, 10)
/// </para>
/// This is the single source of truth for the formula; the client replicates it only for a live
/// preview while the form is being filled in.
/// </summary>
public static class IntensityCalculator
{
    public const decimal MinIntensity = 1m;
    public const decimal MaxIntensity = 10m;

    /// <summary>Computes the stored intensity value (one decimal, clamped to 1–10).</summary>
    public static decimal Calculate(WorkoutType type, int durationMinutes, Gender gender)
    {
        var raw = GetBasePoints(type) + GetDurationModifier(durationMinutes) + GetGenderModifier(gender);
        return Math.Clamp(raw, MinIntensity, MaxIntensity);
    }

    /// <summary>Base intensity score for each workout type.</summary>
    public static decimal GetBasePoints(WorkoutType type) => type switch
    {
        WorkoutType.Cardio => 6m,
        WorkoutType.Strength => 7m,
        WorkoutType.MobilityFlexibility => 3m,
        WorkoutType.Rehabilitation => 1m,
        WorkoutType.FullBody => 7m,
        WorkoutType.UpperBody => 6m,
        WorkoutType.LowerBody => 6m,
        WorkoutType.Core => 6m,
        WorkoutType.Other => 5m,
        _ => throw new ArgumentOutOfRangeException(nameof(type), type, "Unknown workout type.")
    };

    /// <summary>
    /// Modifier based on the workout duration in minutes:
    /// &lt;20 → −1, [20,40) → 0, [40,60) → +0.5, [60,90) → +1, [90,150) → +2, ≥150 → +3.
    /// </summary>
    public static decimal GetDurationModifier(int durationMinutes) => durationMinutes switch
    {
        < 20 => -1m,
        < 40 => 0m,
        < 60 => 0.5m,
        < 90 => 1m,
        < 150 => 2m,
        _ => 3m
    };

    /// <summary>Gender reference modifier: male +0, female +0.5.</summary>
    public static decimal GetGenderModifier(Gender gender) => gender switch
    {
        Gender.Male => 0m,
        Gender.Female => 0.5m,
        _ => throw new ArgumentOutOfRangeException(nameof(gender), gender, "Unknown gender.")
    };
}
