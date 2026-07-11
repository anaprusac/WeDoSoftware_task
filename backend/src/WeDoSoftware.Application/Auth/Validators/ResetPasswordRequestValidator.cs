using FluentValidation;
using WeDoSoftware.Application.Common.Validation;

namespace WeDoSoftware.Application.Auth.Validators;

public class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Token).NotEmpty().WithMessage("Reset token is required.");
        RuleFor(x => x.NewPassword).ValidPassword();
        RuleFor(x => x.ConfirmNewPassword)
            .Equal(x => x.NewPassword).WithMessage("Passwords do not match.");
    }
}
