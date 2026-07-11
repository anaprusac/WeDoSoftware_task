namespace WeDoSoftware.Infrastructure.Configuration;

/// <summary>JWT settings, bound from the "Jwt" configuration section.</summary>
public class JwtOptions
{
    public const string SectionName = "Jwt";

    /// <summary>Signing secret (min 32 chars for HS256). Supplied via config/env, never hard-coded in code.</summary>
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = "WeDoSoftware";
    public string Audience { get; set; } = "WeDoSoftware";
    public int AccessTokenMinutes { get; set; } = 15;
    public int RefreshTokenDays { get; set; } = 7;
}
