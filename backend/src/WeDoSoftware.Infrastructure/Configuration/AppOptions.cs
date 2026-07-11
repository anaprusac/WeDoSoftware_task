namespace WeDoSoftware.Infrastructure.Configuration;

/// <summary>General app settings, bound from the "App" section.</summary>
public class AppOptions
{
    public const string SectionName = "App";

    /// <summary>Base URL of the frontend, used to build the password-reset link in emails.</summary>
    public string FrontendBaseUrl { get; set; } = "http://localhost:4200";
}
