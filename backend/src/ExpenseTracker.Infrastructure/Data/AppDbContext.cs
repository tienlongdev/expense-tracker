using ExpenseTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                  .HasDefaultValueSql("NEWID()");

            entity.Property(e => e.Title)
                  .IsRequired()
                  .HasMaxLength(200);

            entity.Property(e => e.Amount)
                  .HasColumnType("decimal(18,2)")
                  .IsRequired();

            entity.Property(e => e.Type)
                  .HasConversion<int>()
                  .IsRequired();

            entity.Property(e => e.Category)
                  .IsRequired()
                  .HasMaxLength(100);

            entity.Property(e => e.Date)
                  .IsRequired();

            entity.Property(e => e.Note)
                  .HasMaxLength(500);

            entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("GETUTCDATE()");
        });
    }
}