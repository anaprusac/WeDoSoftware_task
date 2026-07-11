namespace WeDoSoftware.Application.Auth;

/// <summary>
/// Response body for successful auth. The refresh token is intentionally absent — it is delivered as an
/// http-only cookie so it is never reachable from JavaScript.
/// </summary>
public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public DateTime AccessTokenExpiresAtUtc { get; set; }
    public UserProfileDto User { get; set; } = default!;
}
