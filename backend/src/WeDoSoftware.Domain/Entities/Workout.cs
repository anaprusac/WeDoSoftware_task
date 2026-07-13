using WeDoSoftware.Domain.Enums;

namespace WeDoSoftware.Domain.Entities;

/// <summary>
/// A single completed workout session logged by a user.
/// <see cref="Intensity"/> is always computed on the server from
/// <see cref="Type"/>, <see cref="DurationMinutes"/> and the user's gender, it is never
/// trusted from the client.
/// </summary>
public class Workout
{
    public Guid Id { get; set; }

    /// <summary>Owner of the workout (FK to the Identity user).</summary>
    public Guid UserId { get; set; }

    public WorkoutType Type { get; set; }

    /// <summary>
    /// Wall-clock moment the workout was performed. Stored as <c>timestamp without time zone</c>
    /// so the date shown to the user is exactly the date it is grouped by (no timezone drift).
    /// Must be in the past and not before the user turned 8.
    /// </summary>
    public DateTime PerformedAt { get; set; }

    public int DurationMinutes { get; set; }

    /// <summary>Optional user-entered calories burned (kcal).</summary>
    public int? Calories { get; set; }

    /// <summary>Subjective tiredness after the workout, on a 1–10 scale.</summary>
    public int Tiredness { get; set; }

    /// <summary>Server-computed intensity on a 1–10 scale, stored with one decimal.</summary>
    public decimal Intensity { get; set; }

    /// <summary>Optional free-text notes.</summary>
    public string? Notes { get; set; }

    /// <summary>UTC instant the record was created.</summary>
    public DateTime CreatedAt { get; set; }
}
