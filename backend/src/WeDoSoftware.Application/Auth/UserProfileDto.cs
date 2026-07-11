using WeDoSoftware.Domain.Enums;

namespace WeDoSoftware.Application.Auth;

/// <summary>The user's profile as exposed to the client.</summary>
public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Gender Gender { get; set; }
    public decimal HeightCm { get; set; }
    public decimal WeightKg { get; set; }
    public decimal Bmi { get; set; }
    public string PreferredLanguage { get; set; } = "en";
    public ThemePreference ThemePreference { get; set; }
    public UnitSystem PreferredUnitSystem { get; set; }
}
