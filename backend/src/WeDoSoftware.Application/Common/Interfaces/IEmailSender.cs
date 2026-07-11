namespace WeDoSoftware.Application.Common.Interfaces;

/// <summary>Sends transactional emails (e.g. password-reset links). Implemented in Infrastructure.</summary>
public interface IEmailSender
{
    Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default);
}
