using WeDoSoftware.Domain.Services;

namespace WeDoSoftware.Tests.Domain;

public class AgeCalculatorTests
{
    [Fact]
    public void DateOfBirthFromAge_returns_first_of_january_of_birth_year()
    {
        var today = new DateOnly(2026, 7, 12);
        Assert.Equal(new DateOnly(2001, 1, 1), AgeCalculator.DateOfBirthFromAge(25, today));
    }

    [Theory]
    [InlineData(2001, 1, 1, 2026, 7, 12, 25)]
    [InlineData(2018, 1, 1, 2026, 1, 1, 8)]
    public void AgeInYears_is_calendar_correct(int by, int bm, int bd, int ty, int tm, int td, int expected)
    {
        var age = AgeCalculator.AgeInYears(new DateOnly(by, bm, bd), new DateOnly(ty, tm, td));
        Assert.Equal(expected, age);
    }

    [Fact]
    public void EarliestWorkoutDate_is_eight_years_after_birth()
    {
        Assert.Equal(new DateOnly(2009, 1, 1), AgeCalculator.EarliestWorkoutDate(new DateOnly(2001, 1, 1)));
    }

    [Fact]
    public void DateOfBirthFromAge_throws_for_negative_age()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => AgeCalculator.DateOfBirthFromAge(-1, new DateOnly(2026, 1, 1)));
    }
}
