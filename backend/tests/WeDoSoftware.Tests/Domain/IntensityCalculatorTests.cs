using WeDoSoftware.Domain.Enums;
using WeDoSoftware.Domain.Services;

namespace WeDoSoftware.Tests.Domain;

public class IntensityCalculatorTests
{
    [Theory]
    [InlineData(WorkoutType.Cardio, 6.0)]
    [InlineData(WorkoutType.Strength, 7.0)]
    [InlineData(WorkoutType.MobilityFlexibility, 3.0)]
    [InlineData(WorkoutType.Rehabilitation, 1.0)]
    [InlineData(WorkoutType.FullBody, 7.0)]
    [InlineData(WorkoutType.UpperBody, 6.0)]
    [InlineData(WorkoutType.LowerBody, 6.0)]
    [InlineData(WorkoutType.Core, 6.0)]
    [InlineData(WorkoutType.Other, 5.0)]
    public void GetBasePoints_returns_expected_per_type(WorkoutType type, double expected)
    {
        Assert.Equal((decimal)expected, IntensityCalculator.GetBasePoints(type));
    }

    [Theory]
    [InlineData(0, -1.0)]
    [InlineData(19, -1.0)]
    [InlineData(20, 0.0)]
    [InlineData(39, 0.0)]
    [InlineData(40, 0.5)]
    [InlineData(59, 0.5)]
    [InlineData(60, 1.0)]
    [InlineData(89, 1.0)]
    [InlineData(90, 2.0)]
    [InlineData(149, 2.0)]
    [InlineData(150, 3.0)]
    [InlineData(300, 3.0)]
    public void GetDurationModifier_respects_bucket_boundaries(int minutes, double expected)
    {
        Assert.Equal((decimal)expected, IntensityCalculator.GetDurationModifier(minutes));
    }

    [Theory]
    [InlineData(Gender.Male, 0.0)]
    [InlineData(Gender.Female, 0.5)]
    public void GetGenderModifier_adds_half_point_for_female(Gender gender, double expected)
    {
        Assert.Equal((decimal)expected, IntensityCalculator.GetGenderModifier(gender));
    }

    [Fact]
    public void Calculate_combines_all_three_components()
    {
        // Cardio(6) + 45min(+0.5) + female(+0.5) = 7.0
        Assert.Equal(7.0m, IntensityCalculator.Calculate(WorkoutType.Cardio, 45, Gender.Female));
    }

    [Fact]
    public void Calculate_clamps_to_minimum_of_one()
    {
        // Rehabilitation(1) + <20min(-1) + male(0) = 0 -> clamped to 1
        Assert.Equal(1.0m, IntensityCalculator.Calculate(WorkoutType.Rehabilitation, 10, Gender.Male));
    }

    [Fact]
    public void Calculate_clamps_to_maximum_of_ten()
    {
        // Strength(7) + >150min(+3) + female(+0.5) = 10.5 -> clamped to 10
        Assert.Equal(10.0m, IntensityCalculator.Calculate(WorkoutType.Strength, 200, Gender.Female));
    }
}
