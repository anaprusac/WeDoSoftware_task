using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WeDoSoftware.Application.Common.Interfaces;
using WeDoSoftware.Infrastructure.Auth;
using WeDoSoftware.Infrastructure.Configuration;
using WeDoSoftware.Infrastructure.Email;
using WeDoSoftware.Infrastructure.Identity;
using WeDoSoftware.Infrastructure.Persistence;
using WeDoSoftware.Infrastructure.Statistics;
using WeDoSoftware.Infrastructure.Workouts;

namespace WeDoSoftware.Infrastructure;

/// <summary>
/// Composition root for the Infrastructure layer: database, Identity, JWT/email services and options.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql => npgsql.EnableRetryOnFailure()));

        services.AddIdentityCore<AppUser>(options =>
        {
            // Secure password policy: min 8 chars incl. lower, upper, digit and symbol.
            options.Password.RequiredLength = 8;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireDigit = true;
            options.Password.RequireNonAlphanumeric = true;

            options.User.RequireUniqueEmail = true;

            // Lockout after repeated failed sign-ins.
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        })
        .AddRoles<IdentityRole<Guid>>()
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders(); // password-reset tokens

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<SmtpOptions>(configuration.GetSection(SmtpOptions.SectionName));
        services.Configure<AppOptions>(configuration.GetSection(AppOptions.SectionName));

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IEmailSender, SmtpEmailSender>();
        services.AddScoped<IWorkoutService, WorkoutService>();
        services.AddScoped<IStatisticsService, StatisticsService>();

        return services;
    }
}
