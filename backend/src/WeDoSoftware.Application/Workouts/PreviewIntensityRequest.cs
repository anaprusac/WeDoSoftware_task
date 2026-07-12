using WeDoSoftware.Domain.Enums;

namespace WeDoSoftware.Application.Workouts;

/// <summary>Request to preview the computed intensity for a (type, duration) pair for the current user.</summary>
public class PreviewIntensityRequest
{
    public WorkoutType Type { get; set; }
    public int DurationMinutes { get; set; }
}

/// <summary>The previewed intensity value on the 1–10 scale.</summary>
public class IntensityPreviewDto
{
    public decimal Intensity { get; set; }
}
