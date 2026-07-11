using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WeDoSoftware.Infrastructure.Identity;
using WeDoSoftware.Infrastructure.Persistence;

namespace WeDoSoftware.Infrastructure;

/// <summary>
/// Composition root for the Infrastructure layer. The API calls <see cref="AddInfrastructure"/>
/// and passes only the connection string, so this layer never depends on the web configuration.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
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
        .AddEntityFrameworkStores<AppDbContext>();
        // Token providers (for password-reset tokens) are added in M2 together with the
        // ASP.NET Core framework reference they require.

        return services;
    }
}
