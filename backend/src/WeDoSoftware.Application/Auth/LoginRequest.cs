namespace WeDoSoftware.Application.Auth;

public class LoginRequest
{
    /// <summary>Either the username or the email address.</summary>
    public string UsernameOrEmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
