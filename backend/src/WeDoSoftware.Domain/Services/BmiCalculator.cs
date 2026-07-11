using WeDoSoftware.Domain.Enums;

namespace WeDoSoftware.Domain.Services;

/// <summary>
/// Pure, framework-free Body Mass Index calculation. Kept in the domain so it is the single
/// source of truth and is trivially unit-testable. The client replicates the same formula only
/// for an instant preview; the server value is authoritative.
/// </summary>
public static class BmiCalculator
{
    /// <summary>
    /// Computes BMI = weight(kg) / height(m)². Result is rounded to two decimals.
    /// </summary>
    /// <param name="heightCm">Height in centimeters (must be &gt; 0).</param>
    /// <param name="weightKg">Weight in kilograms (must be &gt; 0).</param>
    public static decimal Calculate(decimal heightCm, decimal weightKg)
    {
        if (heightCm <= 0)
            throw new ArgumentOutOfRangeException(nameof(heightCm), "Height must be greater than zero.");
        if (weightKg <= 0)
            throw new ArgumentOutOfRangeException(nameof(weightKg), "Weight must be greater than zero.");

        var heightMeters = heightCm / 100m;
        var bmi = weightKg / (heightMeters * heightMeters);
        return Math.Round(bmi, 2, MidpointRounding.AwayFromZero);
    }

    /// <summary>Classifies a BMI value using the standard WHO thresholds.</summary>
    public static BmiCategory Categorize(decimal bmi) => bmi switch
    {
        < 18.5m => BmiCategory.Underweight,
        < 25m => BmiCategory.Normal,
        < 30m => BmiCategory.Overweight,
        _ => BmiCategory.Obese
    };
}
