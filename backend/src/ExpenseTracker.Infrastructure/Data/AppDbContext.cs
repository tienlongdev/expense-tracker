using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Infrastructure.Data;

public class AppDbContext : DbContext
{
    private readonly ICurrentUserService _currentUserService;

    public AppDbContext(
        DbContextOptions<AppDbContext> options,
        ICurrentUserService currentUserService) : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Debt> Debts => Set<Debt>();
    public DbSet<DebtPayment> DebtPayments => Set<DebtPayment>();
    public DbSet<SavingsAccount> SavingsAccounts => Set<SavingsAccount>();
    public DbSet<SavingsHistory> SavingsHistories => Set<SavingsHistory>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(500);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PreferredCurrency).IsRequired().HasMaxLength(10);
            entity.Property(e => e.TimeZone).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasIndex(e => e.Email)
                .IsUnique()
                .HasDatabaseName("IX_User_Email");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Icon).HasMaxLength(50);
            entity.Property(e => e.Color).HasMaxLength(20);
            entity.Property(e => e.Type).HasConversion<int>().IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.HasQueryFilter(e => _currentUserService.UserId.HasValue && e.UserId == _currentUserService.UserId.Value);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Categories)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Amount).HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Type).HasConversion<int>().IsRequired();
            entity.Property(e => e.Date).IsRequired();
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.HasQueryFilter(e => _currentUserService.UserId.HasValue && e.UserId == _currentUserService.UserId.Value);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Transactions)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Transactions)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Debt>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.PersonName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.OriginalAmount).HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.RemainingAmount).HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Type).HasConversion<int>().IsRequired();
            entity.Property(e => e.Status).HasConversion<int>().IsRequired();
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.HasQueryFilter(e => _currentUserService.UserId.HasValue && e.UserId == _currentUserService.UserId.Value);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Debts)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DebtPayment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Amount).HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.PaidDate).IsRequired();
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.HasQueryFilter(e => _currentUserService.UserId.HasValue && e.UserId == _currentUserService.UserId.Value);

            entity.HasOne(e => e.User)
                .WithMany(u => u.DebtPayments)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Debt)
                .WithMany(d => d.Payments)
                .HasForeignKey(e => e.DebtId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SavingsAccount>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Type).HasConversion<int>().IsRequired();
            entity.Property(e => e.InitialAmount).HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.TotalDeposited).HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.CurrentValue).HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.InterestRate).HasColumnType("numeric(5,2)");
            entity.Property(e => e.Status).HasConversion<int>().IsRequired();
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.HasQueryFilter(e => _currentUserService.UserId.HasValue && e.UserId == _currentUserService.UserId.Value);

            entity.HasOne(e => e.User)
                .WithMany(u => u.SavingsAccounts)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SavingsHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.TransactionType).HasConversion<int>().IsRequired();
            entity.Property(e => e.Amount).HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.PreviousValue).HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.NewValue).HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.Date).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Ignore(e => e.ProfitLoss);
            entity.HasQueryFilter(e => _currentUserService.UserId.HasValue && e.UserId == _currentUserService.UserId.Value);

            entity.HasOne(e => e.User)
                .WithMany(u => u.SavingsHistories)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.SavingsAccount)
                .WithMany(a => a.History)
                .HasForeignKey(e => e.SavingsAccountId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Budget>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Year).IsRequired();
            entity.Property(e => e.Month).IsRequired();
            entity.Property(e => e.PlannedAmount).HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.HasQueryFilter(e => _currentUserService.UserId.HasValue && e.UserId == _currentUserService.UserId.Value);

            entity.HasIndex(e => new { e.UserId, e.CategoryId, e.Year, e.Month })
                .IsUnique()
                .HasDatabaseName("IX_Budget_User_Category_YearMonth");

            entity.HasOne(e => e.User)
                .WithMany(u => u.Budgets)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Type).HasConversion<int>().IsRequired();
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.DeduplicationKey).HasMaxLength(200);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.HasQueryFilter(e => _currentUserService.UserId.HasValue && e.UserId == _currentUserService.UserId.Value);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.DeduplicationKey })
                .HasDatabaseName("IX_Notification_User_DeduplicationKey");
        });
    }

    public override int SaveChanges()
    {
        ApplyUserOwnership();
        return base.SaveChanges();
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ApplyUserOwnership();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyUserOwnership();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        ApplyUserOwnership();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void ApplyUserOwnership()
    {
        var currentUserId = _currentUserService.UserId;
        if (!currentUserId.HasValue)
        {
            return;
        }

        foreach (var entry in ChangeTracker.Entries<IUserOwnedEntity>()
                     .Where(e => e.State == EntityState.Added))
        {
            if (entry.Entity.UserId == Guid.Empty)
            {
                entry.Entity.UserId = currentUserId.Value;
            }
        }
    }
}
