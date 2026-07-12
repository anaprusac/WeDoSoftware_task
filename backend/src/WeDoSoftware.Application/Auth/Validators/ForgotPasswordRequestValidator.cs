using FluentValidation;

namespace WeDoSoftware.Application.Auth.Validators;

public class ForgotPasswordRequestValidator : AbstractValidator<ForgotPasswordRequest>
{
    public ForgotPasswordRequestValidator()
    {
        RuleFor(x => x.UsernameOrEmail).NotEmpty().WithMessage("Username or email is required.");
    }
}
