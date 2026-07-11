namespace WeDoSoftware.Application.Auth;

/// <summary>Initiates a password reset. The email is looked up from the username on the server.</summary>
public class ForgotPasswordRequest
{
    public string Username { get; set; } = string.Empty;
}
