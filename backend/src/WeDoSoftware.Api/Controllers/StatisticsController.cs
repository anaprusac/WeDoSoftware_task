using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeDoSoftware.Api.Common;
using WeDoSoftware.Application.Common.Interfaces;
using WeDoSoftware.Application.Statistics;

namespace WeDoSoftware.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/statistics")]
public class StatisticsController : ControllerBase
{
    private readonly IStatisticsService _statisticsService;

    public StatisticsController(IStatisticsService statisticsService)
    {
        _statisticsService = statisticsService;
    }

    /// <summary>Weekly workout statistics for the given month (weeks start on Monday, clipped to the month).</summary>
    [HttpGet]
    public async Task<ActionResult<MonthlyStatisticsDto>> GetMonthly([FromQuery] int year, [FromQuery] int month, CancellationToken cancellationToken)
        => Ok(await _statisticsService.GetMonthlyAsync(User.GetUserId(), year, month, cancellationToken));
}
