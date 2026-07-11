using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text;
using WeDoSoftware.Application.Auth;
using WeDoSoftware.Application.Common.Exceptions;
using WeDoSoftware.Application.Common.Interfaces;
using WeDoSoftware.Application.Common.Models;
using WeDoSoftware.Domain.Entities;
using WeDoSoftware.Domain.Enums;
using WeDoSoftware.Domain.Services;
using WeDoSoftware.Infrastructure.Configuration;
using WeDoSoftware.Infrastructure.Identity;
using WeDoSoftware.Infrastructure.Persistence;

namespace WeDoSoftware.Infrastructure.Auth;

/// <summary>
/// Implements the authentication use-cases on top of ASP.NET Core Identity. Kept in Infrastructure
/// because it depends on <see cref="UserManager{TUser}"/> and the database; the API depends only on
/// the <see cref="IAuthService"/> abstraction.
/// </summary>
public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly AppDbContext _db;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IEmailSender _emailSender;
    private readonly JwtOptions _jwtOptions;
    private readonly AppOptions _appOptions;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<AppUser> userManager,
        AppDbContext db,
        IJwtTokenService jwtTokenService,
        IEmailSender emailSender,
        IOptions<JwtOptions> jwtOptions,
        IOptions<AppOptions> appOptions,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _db = db;
        _jwtTokenService = jwtTokenService;
        _emailSender = emailSender;
        _jwtOptions = jwtOptions.Value;
        _appOptions = appOptions.Value;
        _logger = logger;
    }

    public async Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        if (await _userManager.FindByNameAsync(request.Username) is not null)
            throw new ConflictException("Username is already taken.");

        if (await _userManager.FindByEmailAsync(request.Email) is not null)
            throw new ConflictException("Email is already registered.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            UserName = request.Username,
            Email = request.Email,
            EmailConfirmed = true, // No email-confirmation flow is required for this task.
            Gender = request.Gender,
            DateOfBirth = AgeCalculator.DateOfBirthFromAge(request.Age, today),
            HeightCm = request.HeightCm,
            WeightKg = request.WeightKg,
            Bmi = BmiCalculator.Calculate(request.HeightCm, request.WeightKg),
            PreferredLanguage = "en",
            ThemePreference = ThemePreference.Light,
            PreferredUnitSystem = request.PreferredUnitSystem,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            throw new ConflictException(string.Join(" ", result.Errors.Select(e => e.Description)));

        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByNameAsync(request.UsernameOrEmail)
                   ?? await _userManager.FindByEmailAsync(request.UsernameOrEmail);

        if (user is null)
            throw new UnauthorizedException("Invalid credentials.");

        if (await _userManager.IsLockedOutAsync(user))
            throw new UnauthorizedException("Account is temporarily locked. Please try again later.");

        if (!await _userManager.CheckPasswordAsync(user, request.Password))
        {
            await _userManager.AccessFailedAsync(user);
            throw new UnauthorizedException("Invalid credentials.");
        }

        await _userManager.ResetAccessFailedCountAsync(user);
        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<AuthResult> RefreshAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            throw new UnauthorizedException("Missing refresh token.");

        var hash = RefreshTokenGenerator.Hash(refreshToken);
        var stored = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);

        if (stored is null || !stored.IsActive)
        {
            // Presenting an already-revoked token is a possible theft/replay: revoke the whole chain.
            if (stored is { RevokedAt: not null })
                await RevokeAllForUserAsync(stored.UserId, cancellationToken);
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }

        var user = await _userManager.FindByIdAsync(stored.UserId.ToString());
        if (user is null)
            throw new UnauthorizedException("Invalid or expired refresh token.");

        // Rotate: revoke the presented token and issue a fresh pair.
        var (raw, newHash) = RefreshTokenGenerator.Create();
        var expiresAt = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenDays);

        stored.RevokedAt = DateTime.UtcNow;
        stored.ReplacedByTokenHash = newHash;
        _db.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = newHash,
            ExpiresAt = expiresAt,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync(cancellationToken);

        return await BuildResultAsync(user, raw, expiresAt);
    }

    public async Task LogoutAsync(string? refreshToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return;

        var hash = RefreshTokenGenerator.Hash(refreshToken);
        var stored = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);
        if (stored is { RevokedAt: null })
        {
            stored.RevokedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByNameAsync(request.Username);

        // Respond identically whether or not the account exists, to avoid username enumeration.
        if (user is null || string.IsNullOrWhiteSpace(user.Email))
        {
            _logger.LogInformation("Password reset requested for unknown username '{Username}'.", request.Username);
            return;
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        var link = $"{_appOptions.FrontendBaseUrl.TrimEnd('/')}/reset-password" +
                   $"?email={Uri.EscapeDataString(user.Email)}&token={encodedToken}";

        var body = $"""
            <p>Hello {user.UserName},</p>
            <p>We received a request to reset your WeDoSoftware password.</p>
            <p><a href="{link}">Click here to reset your password</a></p>
            <p>If you did not request this, you can safely ignore this email.</p>
            """;

        await _emailSender.SendAsync(user.Email, "Reset your WeDoSoftware password", body, cancellationToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
            throw new UnauthorizedException("Invalid or expired reset token.");

        string decodedToken;
        try
        {
            decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));
        }
        catch (FormatException)
        {
            throw new UnauthorizedException("Invalid or expired reset token.");
        }

        var result = await _userManager.ResetPasswordAsync(user, decodedToken, request.NewPassword);
        if (!result.Succeeded)
            throw new UnauthorizedException("Invalid or expired reset token.");

        // A reset may indicate a compromised account — invalidate all existing sessions.
        await RevokeAllForUserAsync(user.Id, cancellationToken);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
            throw new NotFoundException("User not found.");

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
            throw new UnauthorizedException(string.Join(" ", result.Errors.Select(e => e.Description)));
    }

    public async Task<UserProfileDto> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
            throw new NotFoundException("User not found.");

        return user.ToProfileDto();
    }

    private async Task<AuthResult> IssueTokensAsync(AppUser user, CancellationToken cancellationToken)
    {
        var (raw, hash) = RefreshTokenGenerator.Create();
        var expiresAt = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenDays);

        _db.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = hash,
            ExpiresAt = expiresAt,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync(cancellationToken);

        return await BuildResultAsync(user, raw, expiresAt);
    }

    private async Task<AuthResult> BuildResultAsync(AppUser user, string refreshTokenRaw, DateTime refreshExpiresAt)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var access = _jwtTokenService.CreateAccessToken(user.Id, user.UserName!, user.Email, roles);

        return new AuthResult
        {
            AccessToken = access.Token,
            AccessTokenExpiresAtUtc = access.ExpiresAtUtc,
            RefreshToken = refreshTokenRaw,
            RefreshTokenExpiresAtUtc = refreshExpiresAt,
            User = user.ToProfileDto()
        };
    }

    private async Task RevokeAllForUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var activeTokens = await _db.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAt == null)
            .ToListAsync(cancellationToken);

        foreach (var token in activeTokens)
            token.RevokedAt = now;

        if (activeTokens.Count > 0)
            await _db.SaveChangesAsync(cancellationToken);
    }
}
