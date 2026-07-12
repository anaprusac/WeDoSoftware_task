using WeDoSoftware.Domain.Entities;

namespace WeDoSoftware.Domain.Services;

/// <summary>An inclusive date range covering (part of) one calendar week within a month.</summary>
public readonly record struct WeekRange(DateOnly Start, DateOnly End);

/// <summary>Aggregated workout statistics for a single week bucket.</summary>
public readonly record struct WeeklyStatistics(
    WeekRange Range,
    int WorkoutCount,
    int TotalDurationMinutes,
    decimal AverageIntensity,
    decimal AverageTiredness);

/// <summary>
/// Pure, framework-free weekly statistics. Weeks start on Monday (ISO) and are clipped to the month:
/// the first bucket runs from the 1st to the first Sunday, full Monday–Sunday weeks follow, and the last
/// bucket runs from the final Monday to the last day of the month.
/// </summary>
public static class WeeklyStatisticsCalculator
{
    /// <summary>Computes the ordered week buckets for the given month.</summary>
    public static IReadOnlyList<WeekRange> GetWeekRanges(int year, int month)
    {
        var firstDay = new DateOnly(year, month, 1);
        var lastDay = new DateOnly(year, month, DateTime.DaysInMonth(year, month));

        var ranges = new List<WeekRange>();
        var current = firstDay;

        while (current <= lastDay)
        {
            // .NET DayOfWeek has Sunday = 0; days remaining until Sunday (end of the ISO week).
            var daysToSunday = (7 - (int)current.DayOfWeek) % 7;
            var weekEnd = current.AddDays(daysToSunday);
            if (weekEnd > lastDay)
                weekEnd = lastDay;

            ranges.Add(new WeekRange(current, weekEnd));
            current = weekEnd.AddDays(1);
        }

        return ranges;
    }

    /// <summary>Buckets the month's workouts into weeks and aggregates each bucket.</summary>
    public static IReadOnlyList<WeeklyStatistics> Build(int year, int month, IEnumerable<Workout> monthWorkouts)
    {
        var workouts = monthWorkouts.ToList();

        return GetWeekRanges(year, month).Select(range =>
        {
            var inWeek = workouts
                .Where(w =>
                {
                    var date = DateOnly.FromDateTime(w.PerformedAt);
                    return date >= range.Start && date <= range.End;
                })
                .ToList();

            if (inWeek.Count == 0)
                return new WeeklyStatistics(range, 0, 0, 0m, 0m);

            var averageIntensity = Math.Round(inWeek.Average(w => w.Intensity), 1, MidpointRounding.AwayFromZero);
            var averageTiredness = Math.Round((decimal)inWeek.Average(w => w.Tiredness), 1, MidpointRounding.AwayFromZero);

            return new WeeklyStatistics(
                range,
                inWeek.Count,
                inWeek.Sum(w => w.DurationMinutes),
                averageIntensity,
                averageTiredness);
        }).ToList();
    }
}
