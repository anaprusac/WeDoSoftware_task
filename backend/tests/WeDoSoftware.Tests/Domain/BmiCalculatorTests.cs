using WeDoSoftware.Domain.Enums;
using WeDoSoftware.Domain.Services;

namespace WeDoSoftware.Tests.Domain;

public class BmiCalculatorTests
{
    [Theory]
    [InlineData(182.0, 82.0, 24.76)]
    [InlineData(168.0, 61.0, 21.61)]
    [InlineData(200.0, 100.0, 25.00)]
    public void Calculate_returns_expected_bmi_rounded_to_two_decimals(double heightCm, double weightKg, double expected)
    {
        var bmi = BmiCalculator.Calculate((decimal)heightCm, (decimal)weightKg);
        Assert.Equal(expected, (double)bmi, 2);
    }

    [Theory]
    [InlineData(0.0)]
    [InlineData(-170.0)]
    public void Calculate_throws_for_non_positive_height(double heightCm)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => BmiCalculator.Calculate((decimal)heightCm, 70m));
    }

    [Fact]
    public void Calculate_throws_for_non_positive_weight()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => BmiCalculator.Calculate(180m, 0m));
    }

    [Theory]
    [InlineData(17.0, BmiCategory.Underweight)]
    [InlineData(18.5, BmiCategory.Normal)]
    [InlineData(24.9, BmiCategory.Normal)]
    [InlineData(25.0, BmiCategory.Overweight)]
    [InlineData(29.9, BmiCategory.Overweight)]
    [InlineData(30.0, BmiCategory.Obese)]
    public void Categorize_uses_who_thresholds(double bmi, BmiCategory expected)
    {
        Assert.Equal(expected, BmiCalculator.Categorize((decimal)bmi));
    }
}
