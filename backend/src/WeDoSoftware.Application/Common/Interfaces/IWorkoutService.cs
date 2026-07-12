using WeDoSoftware.Application.Workouts;
using WeDoSoftware.Domain.Enums;

namespace WeDoSoftware.Application.Common.Interfaces;

/// <summary>Workout use-cases. All operations are scoped to the authenticated user.</summary>
public interface IWorkoutService
{
    Task<WorkoutDto> CreateAsync(Guid userId, CreateWorkoutRequest request, CancellationToken cancellationToken = default);

    Task<WorkoutDto> GetByIdAsync(Guid userId, Guid workoutId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WorkoutDto>> GetRecentAsync(Guid userId, int? limit = null, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WorkoutDto>> GetByDateAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default);

    /// <summary>Distinct dates in the given month that have at least one workout (for the calendar).</summary>
    Task<IReadOnlyList<DateOnly>> GetWorkoutDaysAsync(Guid userId, int year, int month, CancellationToken cancellationToken = default);

    Task<decimal> PreviewIntensityAsync(Guid userId, WorkoutType type, int durationMinutes, CancellationToken cancellationToken = default);

    IReadOnlyList<WorkoutTypeInfoDto> GetWorkoutTypes();
}
