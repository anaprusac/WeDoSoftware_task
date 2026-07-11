namespace WeDoSoftware.Domain.Entities;

/// <summary>
/// A persisted, rotating refresh token. Only the hash of the token is stored, never the
/// raw value, so a database leak cannot be replayed. Rotation is tracked via
/// <see cref="ReplacedByTokenHash"/> to allow detecting reuse of a revoked token.
/// </summary>
public class RefreshToken
{
    public Guid Id { get; set; }

    /// <summary>Owner of the token (FK to the Identity user).</summary>
    public Guid UserId { get; set; }

    /// <summary>SHA-256 hash of the raw refresh token.</summary>
    public string TokenHash { get; set; } = null!;

    public DateTime ExpiresAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    /// <summary>Hash of the token that superseded this one when it was rotated.</summary>
    public string? ReplacedByTokenHash { get; set; }

    public bool IsActive => RevokedAt is null && DateTime.UtcNow < ExpiresAt;
}
