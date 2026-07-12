using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeDoSoftware.Api.Common;
using WeDoSoftware.Application.Common.Interfaces;
using WeDoSoftware.Application.Workouts;

namespace WeDoSoftware.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/workouts")]
public class WorkoutsController : ControllerBase
{
    private readonly IWorkoutService _workoutService;

    public WorkoutsController(IWorkoutService workoutService)
    {
        _workoutService = workoutService;
    }

    /// <summary>Logs a new workout for the current user (intensity is computed server-side).</summary>
    [HttpPost]
    public async Task<ActionResult<WorkoutDto>> Create(CreateWorkoutRequest request, CancellationToken cancellationToken)
    {
        var workout = await _workoutService.CreateAsync(User.GetUserId(), request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = workout.Id }, workout);
    }

    /// <summary>Most recent workouts first (for the home dashboard).</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<WorkoutDto>>> GetRecent([FromQuery] int? limit, CancellationToken cancellationToken)
        => Ok(await _workoutService.GetRecentAsync(User.GetUserId(), limit, cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WorkoutDto>> GetById(Guid id, CancellationToken cancellationToken)
        => Ok(await _workoutService.GetByIdAsync(User.GetUserId(), id, cancellationToken));

    /// <summary>All workouts performed on a given date, in chronological order.</summary>
    [HttpGet("by-date")]
    public async Task<ActionResult<IReadOnlyList<WorkoutDto>>> GetByDate([FromQuery] DateOnly date, CancellationToken cancellationToken)
        => Ok(await _workoutService.GetByDateAsync(User.GetUserId(), date, cancellationToken));

    /// <summary>Distinct dates in a month that have workouts (drives the calendar).</summary>
    [HttpGet("calendar")]
    public async Task<ActionResult<IReadOnlyList<DateOnly>>> GetCalendar([FromQuery] int year, [FromQuery] int month, CancellationToken cancellationToken)
        => Ok(await _workoutService.GetWorkoutDaysAsync(User.GetUserId(), year, month, cancellationToken));

    /// <summary>Workout types and their intensity base points (for the dropdown and live preview).</summary>
    [HttpGet("types")]
    public ActionResult<IReadOnlyList<WorkoutTypeInfoDto>> GetTypes()
        => Ok(_workoutService.GetWorkoutTypes());

    /// <summary>Previews the computed intensity for a type/duration for the current user.</summary>
    [HttpPost("preview-intensity")]
    public async Task<ActionResult<IntensityPreviewDto>> PreviewIntensity(PreviewIntensityRequest request, CancellationToken cancellationToken)
    {
        var intensity = await _workoutService.PreviewIntensityAsync(User.GetUserId(), request.Type, request.DurationMinutes, cancellationToken);
        return Ok(new IntensityPreviewDto { Intensity = intensity });
    }
}
