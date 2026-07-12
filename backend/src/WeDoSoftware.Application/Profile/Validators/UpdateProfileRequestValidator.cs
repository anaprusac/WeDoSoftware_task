using FluentValidation;

namespace WeDoSoftware.Application.Profile.Validators;

public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(x => x.HeightCm)
            .InclusiveBetween(80m, 250m).WithMessage("Height must be between 80 and 250 cm.");

        RuleFor(x => x.WeightKg)
            .InclusiveBetween(35m, 220m).WithMessage("Weight must be between 35 and 220 kg.");

        RuleFor(x => x.PreferredLanguage)
            .NotEmpty()
            .MaximumLength(10);

        RuleFor(x => x.ThemePreference).IsInEnum();
        RuleFor(x => x.PreferredUnitSystem).IsInEnum();
    }
}
