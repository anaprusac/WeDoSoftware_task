using WeDoSoftware.Domain.Enums;

namespace WeDoSoftware.Application.Workouts;

/// <summary>
/// Payload for logging a completed workout. Intensity is deliberately absent — the server computes it
/// from the type, duration and the user's gender, so it can never be spoofed by the client.
/// </summary>
public class CreateWorkoutRequest
{
    public WorkoutType Type { get; set; }

    /// <summary>Naive local wall-clock time the workout was performed (no timezone offset).</summary>
    public DateTime PerformedAt { get; set; }

    public int DurationMinutes { get; set; }
    public int? Calories { get; set; }
    public int Tiredness { get; set; }
    public string? Notes { get; set; }
}
