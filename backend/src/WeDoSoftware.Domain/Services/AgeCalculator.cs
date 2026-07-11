namespace WeDoSoftware.Domain.Services;

/// <summary>
/// Pure helpers for turning the age entered at registration into a stored date of birth, and for the
/// age-derived rules used elsewhere (e.g. the earliest date a workout may have been performed).
/// </summary>
public static class AgeCalculator
{
    /// <summary>Minimum age allowed to have performed a workout.</summary>
    public const int MinimumWorkoutAge = 8;

    /// <summary>
    /// Converts an age in whole years to a date of birth of 1 January of the corresponding year, so the
    /// age stays derivable and correct over time.
    /// </summary>
    public static DateOnly DateOfBirthFromAge(int age, DateOnly today)
    {
        if (age < 0)
            throw new ArgumentOutOfRangeException(nameof(age), "Age cannot be negative.");

        return new DateOnly(today.Year - age, 1, 1);
    }

    /// <summary>Current age in whole years for a given date of birth.</summary>
    public static int AgeInYears(DateOnly dateOfBirth, DateOnly today)
    {
        var age = today.Year - dateOfBirth.Year;
        if (today < dateOfBirth.AddYears(age))
            age--;
        return age;
    }

    /// <summary>The earliest date a workout may have been performed (the day the user turned 8).</summary>
    public static DateOnly EarliestWorkoutDate(DateOnly dateOfBirth) => dateOfBirth.AddYears(MinimumWorkoutAge);
}
