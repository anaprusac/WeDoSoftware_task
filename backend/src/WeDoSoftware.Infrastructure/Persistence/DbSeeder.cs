using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WeDoSoftware.Domain.Entities;
using WeDoSoftware.Domain.Enums;
using WeDoSoftware.Domain.Services;
using WeDoSoftware.Infrastructure.Identity;

namespace WeDoSoftware.Infrastructure.Persistence;

/// <summary>
/// Applies pending migrations and seeds demo data. Idempotent: if any user already exists it does
/// nothing, so it is safe to run on every startup. Demo credentials are documented in the README.
/// Identity users cannot be seeded via <c>HasData</c> (password hashing needs the UserManager),
/// which is why seeding runs here at startup rather than inside a migration.
/// </summary>
public static class DbSeeder
{
    private static readonly WorkoutType[] Types =
    {
        WorkoutType.Cardio, WorkoutType.Strength, WorkoutType.FullBody, WorkoutType.UpperBody,
        WorkoutType.LowerBody, WorkoutType.Core, WorkoutType.MobilityFlexibility,
        WorkoutType.Rehabilitation, WorkoutType.Other
    };

    // Durations chosen to exercise every duration bucket of the intensity formula.
    private static readonly int[] Durations = { 15, 25, 35, 45, 55, 70, 95, 160, 30, 50 };
    private static readonly int[] Tiredness = { 4, 6, 5, 7, 8, 3, 6, 9, 5, 7 };
    private static readonly int?[] Calories = { null, 250, 400, null, 320, 500, 600, 800, null, 350 };
    private static readonly string?[] Notes =
    {
        null, "Felt strong today", null, "Tough session, pushed hard", null,
        "Easy recovery day", null, "New personal best", null, "Early morning session"
    };
    private static readonly (int Hour, int Minute)[] Times =
    {
        (7, 30), (18, 0), (12, 15), (20, 45), (9, 0), (17, 30), (6, 45), (19, 15), (8, 0), (16, 0)
    };

    public static async Task InitializeAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var provider = scope.ServiceProvider;
        var context = provider.GetRequiredService<AppDbContext>();

        await context.Database.MigrateAsync();
        await SeedAsync(context, provider.GetRequiredService<UserManager<AppUser>>());
    }

    private static async Task SeedAsync(AppDbContext context, UserManager<AppUser> userManager)
    {
        if (await context.Users.AnyAsync())
        {
            return; // Already seeded.
        }

        var demo = await CreateUserAsync(userManager, "demo", "demo@example.com", "Demo123!",
            Gender.Male, new DateOnly(1996, 1, 1), heightCm: 182m, weightKg: 82m);

        var ana = await CreateUserAsync(userManager, "ana", "ana@example.com", "Ana12345!",
            Gender.Female, new DateOnly(1999, 1, 1), heightCm: 168m, weightKg: 61m);

        var workouts = new List<Workout>();
        workouts.AddRange(BuildWorkouts(demo.Id, Gender.Male, daysBack: 84, stepDays: 3));
        workouts.AddRange(BuildWorkouts(ana.Id, Gender.Female, daysBack: 52, stepDays: 3));

        // A second workout on an existing demo day so the "multiple workouts per day" view is covered.
        var busyDay = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-4);
        workouts.Add(new Workout
        {
            Id = Guid.NewGuid(),
            UserId = demo.Id,
            Type = WorkoutType.Cardio,
            PerformedAt = new DateTime(busyDay.Year, busyDay.Month, busyDay.Day, 6, 30, 0, DateTimeKind.Unspecified),
            DurationMinutes = 30,
            Calories = 300,
            Tiredness = 5,
            Intensity = IntensityCalculator.Calculate(WorkoutType.Cardio, 30, Gender.Male),
            Notes = "Second session of the day",
            CreatedAt = DateTime.UtcNow
        });

        context.Workouts.AddRange(workouts);
        await context.SaveChangesAsync();
    }

    private static async Task<AppUser> CreateUserAsync(UserManager<AppUser> userManager, string userName,
        string email, string password, Gender gender, DateOnly dateOfBirth, decimal heightCm, decimal weightKg)
    {
        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            UserName = userName,
            Email = email,
            EmailConfirmed = true,
            Gender = gender,
            DateOfBirth = dateOfBirth,
            HeightCm = heightCm,
            WeightKg = weightKg,
            Bmi = BmiCalculator.Calculate(heightCm, weightKg),
            PreferredLanguage = "en",
            ThemePreference = ThemePreference.Light,
            PreferredUnitSystem = UnitSystem.Metric,
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to seed user '{userName}': {errors}");
        }

        return user;
    }

    private static IEnumerable<Workout> BuildWorkouts(Guid userId, Gender gender, int daysBack, int stepDays)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var index = 0;

        // Start one day in the past so no seeded workout is ever "in the future".
        for (var offset = 1; offset <= daysBack; offset += stepDays, index++)
        {
            var date = today.AddDays(-offset);
            var type = Types[index % Types.Length];
            var duration = Durations[index % Durations.Length];
            var (hour, minute) = Times[index % Times.Length];

            yield return new Workout
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = type,
                PerformedAt = new DateTime(date.Year, date.Month, date.Day, hour, minute, 0, DateTimeKind.Unspecified),
                DurationMinutes = duration,
                Calories = Calories[index % Calories.Length],
                Tiredness = Tiredness[index % Tiredness.Length],
                Intensity = IntensityCalculator.Calculate(type, duration, gender),
                Notes = Notes[index % Notes.Length],
                CreatedAt = DateTime.UtcNow
            };
        }
    }
}
