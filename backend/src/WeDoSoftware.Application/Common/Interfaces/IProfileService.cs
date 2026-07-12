using WeDoSoftware.Application.Auth;
using WeDoSoftware.Application.Profile;

namespace WeDoSoftware.Application.Common.Interfaces;

/// <summary>Profile mutation use-cases, kept separate from <see cref="IAuthService"/> (identity/session concerns).</summary>
public interface IProfileService
{
    Task<UserProfileDto> UpdateAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default);
}
