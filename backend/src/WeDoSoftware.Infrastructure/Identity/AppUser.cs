using Microsoft.AspNetCore.Identity;
using WeDoSoftware.Domain.Enums;

namespace WeDoSoftware.Infrastructure.Identity;

/// <summary>
/// Application user, extending ASP.NET Core Identity with the profile fields this app needs.
/// Lives in Infrastructure (the persistence/auth concern) so the Domain layer stays free of
/// framework dependencies. Height and weight are always stored in metric units.
/// </summary>
public class AppUser : IdentityUser<Guid>
{
    /// <summary>
    /// Date of birth. Captured at registration by asking for the user's age and storing
    /// 1 January of the corresponding year, so the age is always derivable and stays correct
    /// over time (and enables the "no workout before the user turned 8" rule).
    /// </summary>
    public DateOnly DateOfBirth { get; set; }

    public Gender Gender { get; set; }

    public decimal HeightCm { get; set; }

    public decimal WeightKg { get; set; }

    /// <summary>BMI snapshot, recomputed whenever height or weight changes.</summary>
    public decimal Bmi { get; set; }

    /// <summary>Preferred UI language (e.g. "en", "sr"); defaults to English.</summary>
    public string PreferredLanguage { get; set; } = "en";

    public ThemePreference ThemePreference { get; set; } = ThemePreference.Light;

    public UnitSystem PreferredUnitSystem { get; set; } = UnitSystem.Metric;

    public DateTime CreatedAt { get; set; }
}
