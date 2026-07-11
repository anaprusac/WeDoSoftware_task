namespace WeDoSoftware.Application.Auth;

/// <summary>Changes the password of the currently authenticated user (requires the current password).</summary>
public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmNewPassword { get; set; } = string.Empty;
}
