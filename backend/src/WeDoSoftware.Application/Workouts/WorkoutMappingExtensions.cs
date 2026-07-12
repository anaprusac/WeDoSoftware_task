using WeDoSoftware.Domain.Entities;

namespace WeDoSoftware.Application.Workouts;

public static class WorkoutMappingExtensions
{
    public static WorkoutDto ToDto(this Workout workout) => new()
    {
        Id = workout.Id,
        Type = workout.Type,
        PerformedAt = workout.PerformedAt,
        DurationMinutes = workout.DurationMinutes,
        Calories = workout.Calories,
        Tiredness = workout.Tiredness,
        Intensity = workout.Intensity,
        Notes = workout.Notes
    };
}
