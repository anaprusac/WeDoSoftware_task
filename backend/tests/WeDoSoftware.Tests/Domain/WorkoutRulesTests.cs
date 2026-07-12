using WeDoSoftware.Domain.Services;

namespace WeDoSoftware.Tests.Domain;

public class WorkoutRulesTests
{
    private static readonly DateTime UtcNow = new(2026, 7, 12, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void IsInFuture_true_for_clearly_future_date()
    {
        Assert.True(WorkoutRules.IsInFuture(UtcNow.AddDays(2), UtcNow));
    }

    [Fact]
    public void IsInFuture_false_for_past()
    {
        Assert.False(WorkoutRules.IsInFuture(UtcNow.AddHours(-1), UtcNow));
    }

    [Fact]
    public void IsInFuture_tolerates_timezone_offset()
    {
        // A "just now" workout from a client up to +14h ahead of server UTC must not be rejected.
        Assert.False(WorkoutRules.IsInFuture(UtcNow.AddHours(10), UtcNow));
    }

    [Fact]
    public void IsBeforeMinimumAge_true_before_user_turns_eight()
    {
        var dob = new DateOnly(2010, 1, 1); // earliest allowed workout: 2018-01-01
        Assert.True(WorkoutRules.IsBeforeMinimumAge(new DateTime(2017, 6, 1, 10, 0, 0), dob));
    }

    [Fact]
    public void IsBeforeMinimumAge_false_after_user_turns_eight()
    {
        var dob = new DateOnly(2010, 1, 1);
        Assert.False(WorkoutRules.IsBeforeMinimumAge(new DateTime(2019, 1, 1, 10, 0, 0), dob));
    }
}
