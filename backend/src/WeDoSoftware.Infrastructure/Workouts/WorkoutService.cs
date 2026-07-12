using Microsoft.EntityFrameworkCore;
using WeDoSoftware.Application.Common.Exceptions;
using WeDoSoftware.Application.Common.Interfaces;
using WeDoSoftware.Application.Workouts;
using WeDoSoftware.Domain.Entities;
using WeDoSoftware.Domain.Enums;
using WeDoSoftware.Domain.Services;
using WeDoSoftware.Infrastructure.Persistence;

namespace WeDoSoftware.Infrastructure.Workouts;

/// <summary>Workout use-cases. Intensity is computed server-side; all queries are scoped to the user.</summary>
public class WorkoutService : IWorkoutService
{
    private const int MaxRecent = 500;

    private readonly AppDbContext _db;

    public WorkoutService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<WorkoutDto> CreateAsync(Guid userId, CreateWorkoutRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
                   ?? throw new NotFoundException("User not found.");

        // Store as a naive wall-clock value (timestamp without time zone).
        var performedAt = DateTime.SpecifyKind(request.PerformedAt, DateTimeKind.Unspecified);

        if (WorkoutRules.IsInFuture(performedAt, DateTime.UtcNow))
            throw new BadRequestException("Workout date and time cannot be in the future.");

        if (WorkoutRules.IsBeforeMinimumAge(performedAt, user.DateOfBirth))
            throw new BadRequestException($"Workout date cannot be before the user turned {AgeCalculator.MinimumWorkoutAge}.");

        var workout = new Workout
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = request.Type,
            PerformedAt = performedAt,
            DurationMinutes = request.DurationMinutes,
            Calories = request.Calories,
            Tiredness = request.Tiredness,
            Intensity = IntensityCalculator.Calculate(request.Type, request.DurationMinutes, user.Gender),
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.Workouts.Add(workout);
        await _db.SaveChangesAsync(cancellationToken);

        return workout.ToDto();
    }

    public async Task<WorkoutDto> GetByIdAsync(Guid userId, Guid workoutId, CancellationToken cancellationToken = default)
    {
        var workout = await _db.Workouts
            .FirstOrDefaultAsync(w => w.Id == workoutId && w.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Workout not found.");

        return workout.ToDto();
    }

    public async Task<IReadOnlyList<WorkoutDto>> GetRecentAsync(Guid userId, int? limit = null, CancellationToken cancellationToken = default)
    {
        var take = limit is > 0 ? Math.Min(limit.Value, MaxRecent) : MaxRecent;

        var workouts = await _db.Workouts
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.PerformedAt)
            .Take(take)
            .ToListAsync(cancellationToken);

        return workouts.Select(w => w.ToDto()).ToList();
    }

    public async Task<IReadOnlyList<WorkoutDto>> GetByDateAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default)
    {
        var start = date.ToDateTime(TimeOnly.MinValue);
        var end = start.AddDays(1);

        var workouts = await _db.Workouts
            .Where(w => w.UserId == userId && w.PerformedAt >= start && w.PerformedAt < end)
            .OrderBy(w => w.PerformedAt)
            .ToListAsync(cancellationToken);

        return workouts.Select(w => w.ToDto()).ToList();
    }

    public async Task<IReadOnlyList<DateOnly>> GetWorkoutDaysAsync(Guid userId, int year, int month, CancellationToken cancellationToken = default)
    {
        if (month is < 1 or > 12)
            throw new BadRequestException("Month must be between 1 and 12.");

        var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Unspecified);
        var end = start.AddMonths(1);

        var dates = await _db.Workouts
            .Where(w => w.UserId == userId && w.PerformedAt >= start && w.PerformedAt < end)
            .Select(w => w.PerformedAt.Date)
            .Distinct()
            .ToListAsync(cancellationToken);

        return dates.Select(DateOnly.FromDateTime).OrderBy(d => d).ToList();
    }

    public async Task<decimal> PreviewIntensityAsync(Guid userId, WorkoutType type, int durationMinutes, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
                   ?? throw new NotFoundException("User not found.");

        return IntensityCalculator.Calculate(type, durationMinutes, user.Gender);
    }

    public IReadOnlyList<WorkoutTypeInfoDto> GetWorkoutTypes()
        => Enum.GetValues<WorkoutType>()
            .Select(type => new WorkoutTypeInfoDto { Type = type, BasePoints = IntensityCalculator.GetBasePoints(type) })
            .ToList();
}
