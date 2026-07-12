namespace WeDoSoftware.Domain.Services;

/// <summary>
/// Pure temporal rules for when a workout may have been performed. Kept framework-free and unit-tested;
/// the application service applies them against the current user and clock.
/// </summary>
public static class WorkoutRules
{
    /// <summary>Upper sanity bound on a single workout's duration (24 hours).</summary>
    public const int MaxDurationMinutes = 1440;

    /// <summary>
    /// Tolerance when checking "not in the future". The stored time is a naive wall-clock value while the
    /// server clock is UTC; allowing up to the largest positive timezone offset avoids falsely rejecting a
    /// just-now workout from a client ahead of UTC, while still blocking clearly future dates.
    /// </summary>
    public const int FutureToleranceHours = 14;

    public static bool IsInFuture(DateTime performedAt, DateTime utcNow)
        => performedAt > utcNow.AddHours(FutureToleranceHours);

    public static bool IsBeforeMinimumAge(DateTime performedAt, DateOnly dateOfBirth)
        => DateOnly.FromDateTime(performedAt) < AgeCalculator.EarliestWorkoutDate(dateOfBirth);
}
