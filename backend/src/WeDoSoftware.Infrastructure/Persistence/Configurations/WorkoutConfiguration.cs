using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WeDoSoftware.Domain.Entities;
using WeDoSoftware.Infrastructure.Identity;

namespace WeDoSoftware.Infrastructure.Persistence.Configurations;

public class WorkoutConfiguration : IEntityTypeConfiguration<Workout>
{
    public void Configure(EntityTypeBuilder<Workout> builder)
    {
        builder.HasKey(w => w.Id);

        builder.Property(w => w.Type).HasConversion<string>().HasMaxLength(40);

        // Wall-clock time: store without a time zone so the grouped date never drifts.
        builder.Property(w => w.PerformedAt).HasColumnType("timestamp without time zone");

        builder.Property(w => w.Intensity).HasPrecision(3, 1);

        builder.Property(w => w.Notes).HasMaxLength(1000);

        // No navigation property on the domain entity, it stays framework-free. The relationship
        // to the Identity user is configured here via the shadow principal.
        builder.HasOne<AppUser>()
            .WithMany()
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(w => new { w.UserId, w.PerformedAt });
    }
}
