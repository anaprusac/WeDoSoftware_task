namespace WeDoSoftware.Domain.Enums;

/// <summary>
/// Stable, language-agnostic keys for the supported workout categories.
/// Display labels are localized on the client (en/sr); the enum name is the persisted,
/// translation-independent identity. Each value maps to a base intensity score in
/// <see cref="WeDoSoftware.Domain.Services.IntensityCalculator"/>.
/// </summary>
public enum WorkoutType
{
    Cardio = 0,
    Strength = 1,
    MobilityFlexibility = 2,
    Rehabilitation = 3,
    FullBody = 4,
    UpperBody = 5,
    LowerBody = 6,
    Core = 7,
    Other = 8
}
