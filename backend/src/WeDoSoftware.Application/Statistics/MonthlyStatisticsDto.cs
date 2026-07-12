namespace WeDoSoftware.Application.Statistics;

/// <summary>Weekly workout statistics for a selected month.</summary>
public class MonthlyStatisticsDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public IReadOnlyList<WeeklyStatDto> Weeks { get; set; } = [];
}
