using System.Security.Claims;
using WeDoSoftware.Application.Common.Exceptions;

namespace WeDoSoftware.Api.Common;

public static class ClaimsPrincipalExtensions
{
    /// <summary>Reads the authenticated user's id from the JWT (the <c>sub</c> claim).</summary>
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var id = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(id, out var userId)
            ? userId
            : throw new UnauthorizedException("The access token does not contain a valid user id.");
    }
}
