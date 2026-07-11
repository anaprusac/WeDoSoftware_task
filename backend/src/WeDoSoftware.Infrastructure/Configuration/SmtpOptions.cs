namespace WeDoSoftware.Infrastructure.Configuration;

/// <summary>
/// SMTP settings, bound from the "Smtp" section. For Gmail: host smtp.gmail.com, port 587, SSL on,
/// username = your address, password = a Google App Password (never your real password).
/// When credentials are absent the email sender falls back to logging, so the app still runs.
/// </summary>
public class SmtpOptions
{
    public const string SectionName = "Smtp";

    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromAddress { get; set; } = string.Empty;
    public string FromName { get; set; } = "WeDoSoftware";
    public bool EnableSsl { get; set; } = true;

    public bool IsConfigured => !string.IsNullOrWhiteSpace(Username) && !string.IsNullOrWhiteSpace(Password);
}
