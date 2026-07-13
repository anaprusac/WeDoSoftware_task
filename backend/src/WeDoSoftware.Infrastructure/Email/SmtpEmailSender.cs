using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WeDoSoftware.Application.Common.Interfaces;
using WeDoSoftware.Infrastructure.Configuration;

namespace WeDoSoftware.Infrastructure.Email;

/// <summary>
/// Sends email over SMTP (Gmail by default). If no credentials are configured it logs the message
/// instead of sending, so the password-reset flow remains testable without real email setup.
/// (For heavy production use, MailKit is preferable to System.Net.Mail.SmtpClient.)
/// </summary>
public class SmtpEmailSender : IEmailSender
{
    private readonly SmtpOptions _options;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IOptions<SmtpOptions> options, ILogger<SmtpEmailSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        if (!_options.IsConfigured)
        {
            _logger.LogWarning(
                "SMTP is not configured, email to {Recipient} not sent. Subject: {Subject}\nBody:\n{Body}",
                toEmail, subject, htmlBody);
            return;
        }

        var fromAddress = string.IsNullOrWhiteSpace(_options.FromAddress) ? _options.Username : _options.FromAddress;

        using var message = new MailMessage
        {
            From = new MailAddress(fromAddress, _options.FromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };
        message.To.Add(toEmail);

        using var client = new SmtpClient(_options.Host, _options.Port)
        {
            EnableSsl = _options.EnableSsl,
            Credentials = new NetworkCredential(_options.Username, _options.Password)
        };

        await client.SendMailAsync(message, cancellationToken);
        _logger.LogInformation("Password-reset email sent to {Recipient}.", toEmail);
    }
}
