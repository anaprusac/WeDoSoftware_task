using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeDoSoftware.Api.Common;
using WeDoSoftware.Application.Auth;
using WeDoSoftware.Application.Common.Interfaces;
using WeDoSoftware.Application.Profile;

namespace WeDoSoftware.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    /// <summary>Updates height/weight (BMI is recomputed), preferred language, theme and unit system.</summary>
    [HttpPut]
    public async Task<ActionResult<UserProfileDto>> Update(UpdateProfileRequest request, CancellationToken cancellationToken)
        => Ok(await _profileService.UpdateAsync(User.GetUserId(), request, cancellationToken));
}
