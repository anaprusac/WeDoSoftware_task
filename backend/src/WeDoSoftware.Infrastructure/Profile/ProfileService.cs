using Microsoft.AspNetCore.Identity;
using WeDoSoftware.Application.Auth;
using WeDoSoftware.Application.Common.Exceptions;
using WeDoSoftware.Application.Common.Interfaces;
using WeDoSoftware.Application.Profile;
using WeDoSoftware.Domain.Services;
using WeDoSoftware.Infrastructure.Identity;

namespace WeDoSoftware.Infrastructure.Profile;

/// <summary>Updates the editable profile fields and recomputes BMI from the (possibly new) height/weight.</summary>
public class ProfileService : IProfileService
{
    private readonly UserManager<AppUser> _userManager;

    public ProfileService(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<UserProfileDto> UpdateAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
                   ?? throw new NotFoundException("User not found.");

        user.HeightCm = request.HeightCm;
        user.WeightKg = request.WeightKg;
        user.Bmi = BmiCalculator.Calculate(request.HeightCm, request.WeightKg);
        user.PreferredLanguage = request.PreferredLanguage;
        user.ThemePreference = request.ThemePreference;
        user.PreferredUnitSystem = request.PreferredUnitSystem;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new BadRequestException(string.Join(" ", result.Errors.Select(e => e.Description)));

        return user.ToProfileDto();
    }
}
