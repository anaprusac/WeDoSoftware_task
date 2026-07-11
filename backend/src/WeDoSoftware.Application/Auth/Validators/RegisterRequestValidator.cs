using FluentValidation;
using WeDoSoftware.Application.Common.Validation;

namespace WeDoSoftware.Application.Auth.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(256);

        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .Length(3, 30).WithMessage("Username must be between 3 and 30 characters.");

        RuleFor(x => x.Password).ValidPassword();

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password).WithMessage("Passwords do not match.");

        RuleFor(x => x.Gender).IsInEnum().WithMessage("Gender is invalid.");

        RuleFor(x => x.Age)
            .InclusiveBetween(8, 100).WithMessage("Age must be between 8 and 100.");

        RuleFor(x => x.HeightCm)
            .InclusiveBetween(80m, 250m).WithMessage("Height must be between 80 and 250 cm.");

        RuleFor(x => x.WeightKg)
            .InclusiveBetween(35m, 220m).WithMessage("Weight must be between 35 and 220 kg.");

        RuleFor(x => x.PreferredUnitSystem).IsInEnum();
    }
}
