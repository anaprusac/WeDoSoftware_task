using WeDoSoftware.Application.Auth;

namespace WeDoSoftware.Application.Common.Models;

/// <summary>
/// Result of a successful authentication. The raw refresh token is returned to the API layer only so
/// it can be placed in an http-only cookie, it is never serialized into the response body.
/// </summary>
public class AuthResult
{
    public required string AccessToken { get; init; }
    public required DateTime AccessTokenExpiresAtUtc { get; init; }
    public required string RefreshToken { get; init; }
    public required DateTime RefreshTokenExpiresAtUtc { get; init; }
    public required UserProfileDto User { get; init; }
}
