using WeDoSoftware.Domain.Enums;

namespace WeDoSoftware.Application.Profile;

/// <summary>
/// Editable profile fields (frame 8): height/weight are accepted+saved automatically as the user types,
/// and BMI is recomputed from them. Username, email and gender are fixed after registration.
/// </summary>
public class UpdateProfileRequest
{
    public decimal HeightCm { get; set; }
    public decimal WeightKg { get; set; }
    public string PreferredLanguage { get; set; } = "en";
    public ThemePreference ThemePreference { get; set; }
    public UnitSystem PreferredUnitSystem { get; set; }
}
