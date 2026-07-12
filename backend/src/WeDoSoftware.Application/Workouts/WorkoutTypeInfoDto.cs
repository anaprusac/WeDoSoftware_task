using WeDoSoftware.Domain.Enums;

namespace WeDoSoftware.Application.Workouts;

/// <summary>Reference data for a workout type: its stable key and intensity base points.</summary>
public class WorkoutTypeInfoDto
{
    public WorkoutType Type { get; set; }
    public decimal BasePoints { get; set; }
}
