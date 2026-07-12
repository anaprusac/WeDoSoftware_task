using FluentValidation;
using WeDoSoftware.Domain.Services;

namespace WeDoSoftware.Application.Workouts.Validators;

/// <summary>
/// Stateless field validation. Temporal rules that depend on the current user and clock (not in the
/// future, not before age 8) are enforced in the workout service where that context is available.
/// </summary>
public class CreateWorkoutRequestValidator : AbstractValidator<CreateWorkoutRequest>
{
    public CreateWorkoutRequestValidator()
    {
        RuleFor(x => x.Type).IsInEnum().WithMessage("Workout type is invalid.");

        RuleFor(x => x.PerformedAt).NotEmpty().WithMessage("Workout date and time are required.");

        RuleFor(x => x.DurationMinutes)
            .InclusiveBetween(1, WorkoutRules.MaxDurationMinutes)
            .WithMessage($"Duration must be between 1 and {WorkoutRules.MaxDurationMinutes} minutes.");

        RuleFor(x => x.Tiredness)
            .InclusiveBetween(1, 10).WithMessage("Tiredness must be between 1 and 10.");

        RuleFor(x => x.Calories)
            .InclusiveBetween(0, 20000).When(x => x.Calories.HasValue)
            .WithMessage("Calories must be between 0 and 20000.");

        RuleFor(x => x.Notes).MaximumLength(1000);
    }
}
