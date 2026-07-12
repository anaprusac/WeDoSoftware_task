using Microsoft.EntityFrameworkCore;
using WeDoSoftware.Application.Common.Exceptions;
using WeDoSoftware.Application.Common.Interfaces;
using WeDoSoftware.Application.Statistics;
using WeDoSoftware.Domain.Services;
using WeDoSoftware.Infrastructure.Persistence;

namespace WeDoSoftware.Infrastructure.Statistics;

/// <summary>
/// Loads a month's workouts once and delegates the bucketing/aggregation to the pure domain calculator.
/// </summary>
public class StatisticsService : IStatisticsService
{
    private readonly AppDbContext _db;

    public StatisticsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<MonthlyStatisticsDto> GetMonthlyAsync(Guid userId, int year, int month, CancellationToken cancellationToken = default)
    {
        if (month is < 1 or > 12)
            throw new BadRequestException("Month must be between 1 and 12.");
        if (year is < 2000 or > 2100)
            throw new BadRequestException("Year is out of range.");

        var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Unspecified);
        var end = start.AddMonths(1);

        var workouts = await _db.Workouts
            .Where(w => w.UserId == userId && w.PerformedAt >= start && w.PerformedAt < end)
            .ToListAsync(cancellationToken);

        var weekly = WeeklyStatisticsCalculator.Build(year, month, workouts);

        return new MonthlyStatisticsDto
        {
            Year = year,
            Month = month,
            Weeks = weekly.Select(w => new WeeklyStatDto
            {
                WeekStart = w.Range.Start,
                WeekEnd = w.Range.End,
                WorkoutCount = w.WorkoutCount,
                TotalDurationMinutes = w.TotalDurationMinutes,
                AverageIntensity = w.AverageIntensity,
                AverageTiredness = w.AverageTiredness
            }).ToList()
        };
    }
}
