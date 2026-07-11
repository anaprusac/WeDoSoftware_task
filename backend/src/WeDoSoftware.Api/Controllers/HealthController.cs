using Microsoft.AspNetCore.Mvc;

namespace WeDoSoftware.Api.Controllers;

/// <summary>Simple liveness endpoint, handy for Docker checks and a quick "is the API up?" test.</summary>
[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { status = "ok", service = "WeDoSoftware API" });
}
