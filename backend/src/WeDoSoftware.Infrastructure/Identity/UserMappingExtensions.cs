using WeDoSoftware.Application.Auth;

namespace WeDoSoftware.Infrastructure.Identity;

/// <summary>Explicit mapping from the Identity user to the client-facing profile DTO.</summary>
public static class UserMappingExtensions
{
    public static UserProfileDto ToProfileDto(this AppUser user) => new()
    {
        Id = user.Id,
        Username = user.UserName ?? string.Empty,
        Email = user.Email ?? string.Empty,
        Gender = user.Gender,
        HeightCm = user.HeightCm,
        WeightKg = user.WeightKg,
        Bmi = user.Bmi,
        PreferredLanguage = user.PreferredLanguage,
        ThemePreference = user.ThemePreference,
        PreferredUnitSystem = user.PreferredUnitSystem
    };
}
