using WeDoSoftware.Domain.Enums;

namespace WeDoSoftware.Application.Workouts;

public class WorkoutDto
{
    public Guid Id { get; set; }
    public WorkoutType Type { get; set; }
    public DateTime PerformedAt { get; set; }
    public int DurationMinutes { get; set; }
    public int? Calories { get; set; }
    public int Tiredness { get; set; }
    public decimal Intensity { get; set; }
    public string? Notes { get; set; }
}
