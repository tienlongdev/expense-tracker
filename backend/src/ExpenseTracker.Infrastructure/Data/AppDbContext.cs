using ExpenseTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Debt> Debts => Set<Debt>();
    public DbSet<DebtPayment> DebtPayments => Set<DebtPayment>();
    public DbSet<SavingsAccount> SavingsAccounts => Set<SavingsAccount>();
    public DbSet<SavingsHistory> SavingsHistories => Set<SavingsHistory>();
    public DbSet<Budget> Budgets => Set<Budget>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ========================
        // Category
        // ========================
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Icon).HasMaxLength(50);
            entity.Property(e => e.Color).HasMaxLength(20);
            entity.Property(e => e.Type).HasConversion<int>().IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
        });

        // ========================
        // Transaction
        // ========================
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

            entity.HasOne(t => t.Category)
                  .WithMany(c => c.Transactions)
                  .HasForeignKey(t => t.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ========================
        // Debt
        // ========================
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
        });

        // ========================
        // DebtPayment
        // ========================
        modelBuilder.Entity<DebtPayment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Amount).HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.PaidDate).IsRequired();
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(p => p.Debt)
                  .WithMany(d => d.Payments)
                  .HasForeignKey(p => p.DebtId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ========================
        // SavingsAccount
        // ========================
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
        });

        // ========================
        // SavingsHistory
        // ========================
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

            entity.HasOne(h => h.SavingsAccount)
                  .WithMany(a => a.History)
                  .HasForeignKey(h => h.SavingsAccountId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ========================
        // Budget
        // ========================
        modelBuilder.Entity<Budget>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.Year).IsRequired();
            entity.Property(e => e.Month).IsRequired();
            entity.Property(e => e.PlannedAmount).HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            // 1 category chỉ có 1 ngân sách mỗi tháng
            entity.HasIndex(e => new { e.CategoryId, e.Year, e.Month })
                  .IsUnique()
                  .HasDatabaseName("IX_Budget_Category_YearMonth");

            entity.HasOne(b => b.Category)
                  .WithMany()
                  .HasForeignKey(b => b.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}