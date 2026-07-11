using WeDoSoftware.Domain.Enums;

namespace WeDoSoftware.Application.Auth;

/// <summary>
/// Registration payload. Height and weight are always sent in metric units (the client converts from
/// imperial before sending). Age is captured as a number and converted to a date of birth on the server.
/// </summary>
public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
    public Gender Gender { get; set; }
    public int Age { get; set; }
    public decimal HeightCm { get; set; }
    public decimal WeightKg { get; set; }
    public UnitSystem PreferredUnitSystem { get; set; } = UnitSystem.Metric;
}
