namespace WeDoSoftware.Application.Auth;

/// <summary>Initiates a password reset. The account is looked up by username or email on the server.</summary>
public class ForgotPasswordRequest
{
    public string UsernameOrEmail { get; set; } = string.Empty;
}
