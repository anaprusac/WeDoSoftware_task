using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeDoSoftware.Api.Common;
using WeDoSoftware.Application.Auth;
using WeDoSoftware.Application.Common.Interfaces;
using WeDoSoftware.Application.Common.Models;

namespace WeDoSoftware.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private const string RefreshCookieName = "refreshToken";

    private readonly IAuthService _authService;
    private readonly IWebHostEnvironment _environment;

    public AuthController(IAuthService authService, IWebHostEnvironment environment)
    {
        _authService = authService;
        _environment = environment;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken cancellationToken)
        => Ok(WithRefreshCookie(await _authService.RegisterAsync(request, cancellationToken)));

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
        => Ok(WithRefreshCookie(await _authService.LoginAsync(request, cancellationToken)));

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh(CancellationToken cancellationToken)
    {
        var token = Request.Cookies[RefreshCookieName] ?? string.Empty;
        return Ok(WithRefreshCookie(await _authService.RefreshAsync(token, cancellationToken)));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        await _authService.LogoutAsync(Request.Cookies[RefreshCookieName], cancellationToken);
        Response.Cookies.Delete(RefreshCookieName, new CookieOptions { Path = "/" });
        return NoContent();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        await _authService.ForgotPasswordAsync(request, cancellationToken);
        // Always the same response, to avoid revealing whether a username exists.
        return Ok(new { message = "If an account with that username exists, a password-reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        await _authService.ResetPasswordAsync(request, cancellationToken);
        return Ok(new { message = "Your password has been reset. You can now sign in." });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        await _authService.ChangePasswordAsync(User.GetUserId(), request, cancellationToken);
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> Me(CancellationToken cancellationToken)
        => Ok(await _authService.GetProfileAsync(User.GetUserId(), cancellationToken));

    /// <summary>Stores the refresh token in an http-only cookie and returns the body without it.</summary>
    private AuthResponse WithRefreshCookie(AuthResult result)
    {
        Response.Cookies.Append(RefreshCookieName, result.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = !_environment.IsDevelopment(), // over HTTP in local dev; HTTPS-only in production
            SameSite = SameSiteMode.Lax,
            Expires = result.RefreshTokenExpiresAtUtc,
            Path = "/"
        });

        return new AuthResponse
        {
            AccessToken = result.AccessToken,
            AccessTokenExpiresAtUtc = result.AccessTokenExpiresAtUtc,
            User = result.User
        };
    }
}
