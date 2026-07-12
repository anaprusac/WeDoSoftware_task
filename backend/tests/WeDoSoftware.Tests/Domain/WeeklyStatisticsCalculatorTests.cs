using WeDoSoftware.Domain.Entities;
using WeDoSoftware.Domain.Enums;
using WeDoSoftware.Domain.Services;

namespace WeDoSoftware.Tests.Domain;

public class WeeklyStatisticsCalculatorTests
{
    public static IEnumerable<object[]> Months() =>
    [
        [2026, 7],   // 31 days, starts Wednesday
        [2025, 2],   // 28 days, non-leap February
        [2024, 2],   // 29 days, leap February
        [2026, 11],  // 30 days
        [2026, 1],   // 31 days, starts Thursday
        [2026, 3],   // starts Sunday
        [2027, 2]    // February starting mid-week
    ];

    [Theory]
    [MemberData(nameof(Months))]
    public void GetWeekRanges_covers_month_contiguously_with_monday_starts(int year, int month)
    {
        var ranges = WeeklyStatisticsCalculator.GetWeekRanges(year, month);
        var first = new DateOnly(year, month, 1);
        var last = new DateOnly(year, month, DateTime.DaysInMonth(year, month));

        Assert.NotEmpty(ranges);
        Assert.Equal(first, ranges[0].Start);
        Assert.Equal(last, ranges[^1].End);

        for (var i = 0; i < ranges.Count; i++)
        {
            Assert.True(ranges[i].Start <= ranges[i].End);

            if (i > 0)
            {
                // Contiguous, no gaps/overlaps.
                Assert.Equal(ranges[i - 1].End.AddDays(1), ranges[i].Start);
                // Every bucket after the first starts on Monday.
                Assert.Equal(DayOfWeek.Monday, ranges[i].Start.DayOfWeek);
            }

            // Every bucket before the last ends on Sunday.
            if (i < ranges.Count - 1)
                Assert.Equal(DayOfWeek.Sunday, ranges[i].End.DayOfWeek);

            // Middle buckets are exactly 7 days.
            if (i > 0 && i < ranges.Count - 1)
                Assert.Equal(6, ranges[i].End.DayNumber - ranges[i].Start.DayNumber);
        }
    }

    [Fact]
    public void GetWeekRanges_july_2026_has_expected_boundaries()
    {
        // July 2026 starts on a Wednesday.
        var ranges = WeeklyStatisticsCalculator.GetWeekRanges(2026, 7);

        Assert.Equal(5, ranges.Count);
        Assert.Equal(new WeekRange(new DateOnly(2026, 7, 1), new DateOnly(2026, 7, 5)), ranges[0]);
        Assert.Equal(new WeekRange(new DateOnly(2026, 7, 6), new DateOnly(2026, 7, 12)), ranges[1]);
        Assert.Equal(new WeekRange(new DateOnly(2026, 7, 27), new DateOnly(2026, 7, 31)), ranges[^1]);
    }

    [Fact]
    public void Build_aggregates_each_week()
    {
        var user = Guid.NewGuid();
        var workouts = new List<Workout>
        {
            MakeWorkout(user, new DateTime(2026, 7, 6, 8, 0, 0), duration: 30, intensity: 6.0m, tiredness: 5),
            MakeWorkout(user, new DateTime(2026, 7, 8, 8, 0, 0), duration: 60, intensity: 8.0m, tiredness: 7),
        };

        var stats = WeeklyStatisticsCalculator.Build(2026, 7, workouts);

        // Bucket 0 = Jul 1–5 (empty), bucket 1 = Jul 6–12 (both workouts).
        Assert.Equal(0, stats[0].WorkoutCount);
        Assert.Equal(2, stats[1].WorkoutCount);
        Assert.Equal(90, stats[1].TotalDurationMinutes);
        Assert.Equal(7.0m, stats[1].AverageIntensity);
        Assert.Equal(6.0m, stats[1].AverageTiredness);
    }

    private static Workout MakeWorkout(Guid userId, DateTime performedAt, int duration, decimal intensity, int tiredness) => new()
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        Type = WorkoutType.Cardio,
        PerformedAt = performedAt,
        DurationMinutes = duration,
        Intensity = intensity,
        Tiredness = tiredness,
        CreatedAt = DateTime.UtcNow
    };
}
