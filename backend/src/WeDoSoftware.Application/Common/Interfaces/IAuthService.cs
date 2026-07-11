using WeDoSoftware.Application.Auth;
using WeDoSoftware.Application.Common.Models;

namespace WeDoSoftware.Application.Common.Interfaces;

/// <summary>
/// Authentication use-cases. The API controller is a thin adapter over this contract; it only adds
/// the HTTP-specific concern of storing the refresh token in an http-only cookie.
/// </summary>
public interface IAuthService
{
    Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);

    Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);

    Task<AuthResult> RefreshAsync(string refreshToken, CancellationToken cancellationToken = default);

    Task LogoutAsync(string? refreshToken, CancellationToken cancellationToken = default);

    Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default);

    Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);

    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default);

    Task<UserProfileDto> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default);
}
