using FluentValidation;

namespace WeDoSoftware.Application.Common.Validation;

/// <summary>
/// Single source of truth for the password policy, reused by the register, reset and change-password
/// validators. Mirrors the ASP.NET Core Identity options configured in Infrastructure.
/// </summary>
public static class PasswordRules
{
    public const int MinLength = 8;

    public static IRuleBuilderOptions<T, string> ValidPassword<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(MinLength).WithMessage($"Password must be at least {MinLength} characters long.")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one digit.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one symbol.");
    }
}
