namespace WeDoSoftware.Application.Statistics;

/// <summary>Aggregated statistics for one week of a month.</summary>
public class WeeklyStatDto
{
    public DateOnly WeekStart { get; set; }
    public DateOnly WeekEnd { get; set; }
    public int WorkoutCount { get; set; }
    public int TotalDurationMinutes { get; set; }
    public decimal AverageIntensity { get; set; }
    public decimal AverageTiredness { get; set; }
}
