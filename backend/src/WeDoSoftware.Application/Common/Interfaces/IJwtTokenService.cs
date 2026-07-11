namespace WeDoSoftware.Application.Common.Interfaces;

/// <summary>Issues signed JWT access tokens. Implemented in Infrastructure.</summary>
public interface IJwtTokenService
{
    AccessToken CreateAccessToken(Guid userId, string userName, string? email, IEnumerable<string> roles);
}

/// <summary>A signed access token together with its absolute (UTC) expiry.</summary>
public record AccessToken(string Token, DateTime ExpiresAtUtc);
