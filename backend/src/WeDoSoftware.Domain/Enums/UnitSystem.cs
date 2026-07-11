namespace WeDoSoftware.Domain.Enums;

/// <summary>
/// The user's preferred measurement system for displaying height and weight.
/// Values are always stored canonically in metric (cm/kg); this preference only
/// affects presentation and input on the client.
/// </summary>
public enum UnitSystem
{
    Metric = 0,
    Imperial = 1
}
