using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WeDoSoftware.Infrastructure.Identity;

namespace WeDoSoftware.Infrastructure.Persistence.Configurations;

public class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> builder)
    {
        builder.Property(u => u.HeightCm).HasPrecision(5, 2);
        builder.Property(u => u.WeightKg).HasPrecision(5, 2);
        builder.Property(u => u.Bmi).HasPrecision(5, 2);

        // Persist enums as readable strings rather than opaque integers.
        builder.Property(u => u.Gender).HasConversion<string>().HasMaxLength(20);
        builder.Property(u => u.ThemePreference).HasConversion<string>().HasMaxLength(20);
        builder.Property(u => u.PreferredUnitSystem).HasConversion<string>().HasMaxLength(20);

        builder.Property(u => u.PreferredLanguage).HasMaxLength(10);
    }
}
