namespace WeDoSoftware.Domain.Enums;

/// <summary>
/// World Health Organization BMI classification, derived from a BMI value by
/// <see cref="WeDoSoftware.Domain.Services.BmiCalculator.Categorize"/>.
/// </summary>
public enum BmiCategory
{
    Underweight = 0,
    Normal = 1,
    Overweight = 2,
    Obese = 3
}
