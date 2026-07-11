using System.Security.Cryptography;
using System.Text;

namespace WeDoSoftware.Infrastructure.Auth;

/// <summary>
/// Creates cryptographically-random refresh tokens and their SHA-256 hashes. Only the hash is stored,
/// so the raw token (handed to the client via cookie) cannot be reconstructed from the database.
/// </summary>
public static class RefreshTokenGenerator
{
    /// <summary>Returns a new (raw token, hash) pair. The raw value is URL/cookie-safe hex.</summary>
    public static (string Raw, string Hash) Create()
    {
        var raw = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        return (raw, Hash(raw));
    }

    public static string Hash(string rawToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexString(bytes);
    }
}
