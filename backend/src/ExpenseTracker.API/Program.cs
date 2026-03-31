using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Application.Services;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;
using ExpenseTracker.Infrastructure.Data;
using ExpenseTracker.Infrastructure.Jobs;
using ExpenseTracker.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Quartz;

var builder = WebApplication.CreateBuilder(args);

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 10, maxRetryDelay: TimeSpan.FromSeconds(15), errorCodesToAdd: null)
    );
    options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

// DI — Repositories
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IDebtRepository, DebtRepository>();
builder.Services.AddScoped<ISavingsRepository, SavingsRepository>();
builder.Services.AddScoped<IBudgetRepository, BudgetRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

// DI — Services
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IDebtService, DebtService>();
builder.Services.AddScoped<ISavingsService, SavingsService>();
builder.Services.AddScoped<IBudgetService, BudgetService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// Quartz.NET — Weekly Summary Job
builder.Services.AddQuartz(q =>
{
    var jobKey = new JobKey("WeeklySummaryJob");

    q.AddJob<WeeklySummaryJob>(opts => opts.WithIdentity(jobKey));

    q.AddTrigger(opts => opts
        .ForJob(jobKey)
        .WithIdentity("WeeklySummaryJob-trigger")
        // Chạy mỗi Chủ nhật lúc 21:00 UTC (= 04:00 sáng Thứ 2 giờ ICT)
        .WithCronSchedule("0 0 21 ? * SUN"));
});
builder.Services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", p =>
        p.WithOrigins(
            "http://localhost:3000",
            "http://localhost:3002"
        ).AllowAnyHeader().AllowAnyMethod())
);

var app = builder.Build();

static DateTime UtcDate(int year, int month, int day) =>
    new(year, month, day, 0, 0, 0, DateTimeKind.Utc);

// ========================
// Auto Migrate + Seed
// ========================
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    // ── Categories ──────────────────────────────────────────────────────
    if (!db.Categories.Any())
    {
        db.Categories.AddRange(
            new() { Id = new Guid("10000000-0000-0000-0000-000000000001"), Name = "Lương", Icon = "💰", Color = "#4CAF50", Type = TransactionType.Income, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("10000000-0000-0000-0000-000000000002"), Name = "Thu nhập phụ", Icon = "💵", Color = "#8BC34A", Type = TransactionType.Income, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("10000000-0000-0000-0000-000000000003"), Name = "Đầu tư", Icon = "📈", Color = "#2196F3", Type = TransactionType.Income, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("10000000-0000-0000-0000-000000000004"), Name = "Quà tặng / Thưởng", Icon = "🎁", Color = "#9C27B0", Type = TransactionType.Income, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000001"), Name = "Ăn uống", Icon = "🍜", Color = "#FF5722", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000002"), Name = "Chi tiêu hàng ngày", Icon = "🛒", Color = "#FF9800", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000003"), Name = "Quần áo", Icon = "👗", Color = "#E91E63", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000004"), Name = "Mỹ phẩm", Icon = "💄", Color = "#F06292", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000005"), Name = "Phí giao lưu", Icon = "🎉", Color = "#BA68C8", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000006"), Name = "Y tế", Icon = "🏥", Color = "#00BCD4", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000007"), Name = "Giáo dục", Icon = "📚", Color = "#3F51B5", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000008"), Name = "Tiền nhà", Icon = "🏠", Color = "#795548", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000009"), Name = "Đi lại", Icon = "🚗", Color = "#607D8B", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000010"), Name = "Cưới hỏi tiệc tùng", Icon = "💒", Color = "#FF4081", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000011"), Name = "Điện / Nước / Internet", Icon = "⚡", Color = "#FFC107", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000012"), Name = "Giải trí", Icon = "🎮", Color = "#00E676", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow }
        );
        db.SaveChanges();

        if (!db.Transactions.Any())
        {
            var now = DateTime.UtcNow;
            db.Transactions.AddRange(
                new Transaction { Id = Guid.NewGuid(), Title = "Lương tháng 3", Amount = 15_000_000, Type = TransactionType.Income, CategoryId = new Guid("10000000-0000-0000-0000-000000000001"), Date = UtcDate(now.Year, now.Month, 1) },
                new Transaction { Id = Guid.NewGuid(), Title = "Tiền nhà tháng 3", Amount = 3_500_000, Type = TransactionType.Expense, CategoryId = new Guid("20000000-0000-0000-0000-000000000008"), Date = UtcDate(now.Year, now.Month, 2) },
                new Transaction { Id = Guid.NewGuid(), Title = "Ăn sáng + trưa", Amount = 250_000, Type = TransactionType.Expense, CategoryId = new Guid("20000000-0000-0000-0000-000000000001"), Date = UtcDate(now.Year, now.Month, 5) },
                new Transaction { Id = Guid.NewGuid(), Title = "Thu nhập freelance", Amount = 5_000_000, Type = TransactionType.Income, CategoryId = new Guid("10000000-0000-0000-0000-000000000002"), Date = UtcDate(now.Year, now.Month, 10) },
                new Transaction { Id = Guid.NewGuid(), Title = "Mua quần áo", Amount = 800_000, Type = TransactionType.Expense, CategoryId = new Guid("20000000-0000-0000-0000-000000000003"), Date = UtcDate(now.Year, now.Month, 12) },
                new Transaction { Id = Guid.NewGuid(), Title = "Khám sức khoẻ", Amount = 300_000, Type = TransactionType.Expense, CategoryId = new Guid("20000000-0000-0000-0000-000000000006"), Date = UtcDate(now.Year, now.Month, 15) },
                new Transaction { Id = Guid.NewGuid(), Title = "Điện + nước tháng 3", Amount = 450_000, Type = TransactionType.Expense, CategoryId = new Guid("20000000-0000-0000-0000-000000000011"), Date = UtcDate(now.Year, now.Month, 16) },
                new Transaction { Id = Guid.NewGuid(), Title = "Đi grab + xăng", Amount = 350_000, Type = TransactionType.Expense, CategoryId = new Guid("20000000-0000-0000-0000-000000000009"), Date = UtcDate(now.Year, now.Month, 17) }
            );
            db.SaveChanges();
        }
    }

    // ── Debts ────────────────────────────────────────────────────────────
    if (!db.Debts.Any())
    {
        var now = DateTime.UtcNow;
        db.Debts.AddRange(
            new Debt { Id = Guid.NewGuid(), Title = "Vay tiền mua xe máy", PersonName = "Anh Minh", OriginalAmount = 10_000_000, RemainingAmount = 7_000_000, Type = DebtType.Borrowed, Status = DebtStatus.PartiallyPaid, DueDate = now.AddMonths(3), CreatedAt = now },
            new Debt { Id = Guid.NewGuid(), Title = "Cho bạn mượn đi du lịch", PersonName = "Chị Lan", OriginalAmount = 3_000_000, RemainingAmount = 3_000_000, Type = DebtType.Lent, Status = DebtStatus.Unpaid, DueDate = now.AddMonths(1), CreatedAt = now }
        );
        db.SaveChanges();
    }

    // ── Savings ──────────────────────────────────────────────────────────
    if (!db.SavingsAccounts.Any())
    {
        var now = DateTime.UtcNow;
        var savId = Guid.NewGuid();
        var stockId = Guid.NewGuid();
        db.SavingsAccounts.AddRange(
            new SavingsAccount { Id = savId, Name = "Tiết kiệm VCB 6 tháng", Type = SavingsType.Savings, InitialAmount = 50_000_000, TotalDeposited = 50_000_000, CurrentValue = 51_250_000, InterestRate = 5.5m, StartDate = now.AddMonths(-3), MaturityDate = now.AddMonths(3), Status = SavingsStatus.Active, CreatedAt = now.AddMonths(-3) },
            new SavingsAccount { Id = stockId, Name = "Danh mục chứng khoán", Type = SavingsType.Stock, InitialAmount = 20_000_000, TotalDeposited = 25_000_000, CurrentValue = 28_500_000, StartDate = now.AddMonths(-6), Status = SavingsStatus.Active, CreatedAt = now.AddMonths(-6) }
        );
        db.SaveChanges();
        db.SavingsHistories.AddRange(
            new SavingsHistory { Id = Guid.NewGuid(), SavingsAccountId = savId, TransactionType = SavingsTransactionType.Deposit, Amount = 50_000_000, PreviousValue = 0, NewValue = 50_000_000, Note = "Nạp vốn ban đầu", Date = now.AddMonths(-3), CreatedAt = now.AddMonths(-3) },
            new SavingsHistory { Id = Guid.NewGuid(), SavingsAccountId = savId, TransactionType = SavingsTransactionType.InterestReceived, Amount = 1_250_000, PreviousValue = 50_000_000, NewValue = 51_250_000, Note = "Lãi tháng 1", Date = now.AddMonths(-1), CreatedAt = now.AddMonths(-1) },
            new SavingsHistory { Id = Guid.NewGuid(), SavingsAccountId = stockId, TransactionType = SavingsTransactionType.Deposit, Amount = 20_000_000, PreviousValue = 0, NewValue = 20_000_000, Note = "Nạp vốn ban đầu", Date = now.AddMonths(-6), CreatedAt = now.AddMonths(-6) },
            new SavingsHistory { Id = Guid.NewGuid(), SavingsAccountId = stockId, TransactionType = SavingsTransactionType.ValueUpdate, Amount = 0, PreviousValue = 25_000_000, NewValue = 28_500_000, Note = "Tăng 3,500,000đ (+14%)", Date = now.AddDays(-7), CreatedAt = now.AddDays(-7) }
        );
        db.SaveChanges();
    }

    // ── Budgets (tháng hiện tại) ─────────────────────────────────────────
    if (!db.Budgets.Any())
    {
        var now = DateTime.UtcNow;
        db.Budgets.AddRange(
            new Budget { Id = Guid.NewGuid(), CategoryId = new Guid("20000000-0000-0000-0000-000000000001"), Year = now.Year, Month = now.Month, PlannedAmount = 2_000_000, Note = "Ăn uống tháng 3", CreatedAt = now },
            new Budget { Id = Guid.NewGuid(), CategoryId = new Guid("20000000-0000-0000-0000-000000000008"), Year = now.Year, Month = now.Month, PlannedAmount = 4_000_000, Note = "Tiền thuê nhà", CreatedAt = now },
            new Budget { Id = Guid.NewGuid(), CategoryId = new Guid("20000000-0000-0000-0000-000000000009"), Year = now.Year, Month = now.Month, PlannedAmount = 500_000, Note = "Xăng xe + grab", CreatedAt = now },
            new Budget { Id = Guid.NewGuid(), CategoryId = new Guid("20000000-0000-0000-0000-000000000011"), Year = now.Year, Month = now.Month, PlannedAmount = 600_000, Note = "Điện nước internet", CreatedAt = now },
            new Budget { Id = Guid.NewGuid(), CategoryId = new Guid("20000000-0000-0000-0000-000000000003"), Year = now.Year, Month = now.Month, PlannedAmount = 500_000, Note = "Quần áo tháng này", CreatedAt = now },
            new Budget { Id = Guid.NewGuid(), CategoryId = new Guid("20000000-0000-0000-0000-000000000006"), Year = now.Year, Month = now.Month, PlannedAmount = 500_000, Note = "Khám sức khoẻ định kỳ", CreatedAt = now },
            new Budget { Id = Guid.NewGuid(), CategoryId = new Guid("20000000-0000-0000-0000-000000000002"), Year = now.Year, Month = now.Month, PlannedAmount = 800_000, Note = "Chi tiêu lặt vặt", CreatedAt = now }
        );
        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.Run();
