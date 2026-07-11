using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WeDoSoftware.Domain.Entities;
using WeDoSoftware.Infrastructure.Identity;

namespace WeDoSoftware.Infrastructure.Persistence;

/// <summary>
/// EF Core database context. Combines ASP.NET Core Identity (users/roles with Guid keys) with the
/// application's own aggregates. Entity mappings are applied from
/// <see cref="Persistence.Configurations"/> to keep this class thin.
/// </summary>
public class AppDbContext : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Workout> Workouts => Set<Workout>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
