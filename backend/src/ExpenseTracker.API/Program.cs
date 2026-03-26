using System.Text;
using ExpenseTracker.API.Services;
using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Application.Services;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;
using ExpenseTracker.Infrastructure.Data;
using ExpenseTracker.Infrastructure.Jobs;
using ExpenseTracker.Infrastructure.Repositories;
using ExpenseTracker.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Quartz;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
builder.Services.AddHttpContextAccessor();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var jwtKey = builder.Configuration["Jwt:Key"] ?? "expense-tracker-dev-key-change-this";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ExpenseTracker";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "ExpenseTracker.Frontend";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build());

builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IDebtRepository, DebtRepository>();
builder.Services.AddScoped<ISavingsRepository, SavingsRepository>();
builder.Services.AddScoped<IBudgetRepository, BudgetRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IDebtService, DebtService>();
builder.Services.AddScoped<ISavingsService, SavingsService>();
builder.Services.AddScoped<IBudgetService, BudgetService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

builder.Services.AddScoped<IPasswordHasherService, PasswordHasherService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

builder.Services.AddQuartz(q =>
{
    var jobKey = new JobKey("WeeklySummaryJob");

    q.AddJob<WeeklySummaryJob>(opts => opts.WithIdentity(jobKey));
    q.AddTrigger(opts => opts
        .ForJob(jobKey)
        .WithIdentity("WeeklySummaryJob-trigger")
        .WithCronSchedule("0 0 21 ? * SUN"));
});
builder.Services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:3000", "http://localhost:3002")
            .AllowAnyHeader()
            .AllowAnyMethod()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var currentUserService = scope.ServiceProvider.GetRequiredService<ICurrentUserService>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasherService>();

    await db.Database.MigrateAsync();

    const string demoEmail = "demo@expense-tracker.local";
    var demoUser = await db.Users.FirstOrDefaultAsync(x => x.Email == demoEmail);

    if (demoUser is null)
    {
        demoUser = new User
        {
            Email = demoEmail,
            PasswordHash = passwordHasher.HashPassword("Demo@123"),
            FullName = "Demo User",
            PreferredCurrency = "VND",
            TimeZone = "Asia/Saigon",
            CreatedAt = DateTime.UtcNow
        };

        db.Users.Add(demoUser);
        await db.SaveChangesAsync();
    }

    currentUserService.SetOverrideUserId(demoUser.Id);
    await SeedDefaultCategoriesAsync(db);
    await SeedDemoDataAsync(db);
    currentUserService.ClearOverrideUserId();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

static DateTime UtcDate(int year, int month, int day) =>
    new(year, month, day, 0, 0, 0, DateTimeKind.Utc);

static async Task SeedDefaultCategoriesAsync(AppDbContext db)
{
    if (await db.Categories.AnyAsync())
    {
        return;
    }

    var now = DateTime.UtcNow;
    db.Categories.AddRange(
        new Category { Name = "Lương", Icon = "💰", Color = "#4CAF50", Type = TransactionType.Income, IsDefault = true, CreatedAt = now },
        new Category { Name = "Thu nhập phụ", Icon = "💵", Color = "#8BC34A", Type = TransactionType.Income, IsDefault = true, CreatedAt = now },
        new Category { Name = "Đầu tư", Icon = "📈", Color = "#2196F3", Type = TransactionType.Income, IsDefault = true, CreatedAt = now },
        new Category { Name = "Quà tặng / Thưởng", Icon = "🎁", Color = "#9C27B0", Type = TransactionType.Income, IsDefault = true, CreatedAt = now },
        new Category { Name = "Ăn uống", Icon = "🍜", Color = "#FF5722", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
        new Category { Name = "Chi tiêu hàng ngày", Icon = "🛒", Color = "#FF9800", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
        new Category { Name = "Quần áo", Icon = "👗", Color = "#E91E63", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
        new Category { Name = "Mỹ phẩm", Icon = "💄", Color = "#F06292", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
        new Category { Name = "Phí giao lưu", Icon = "🎉", Color = "#BA68C8", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
        new Category { Name = "Y tế", Icon = "🏥", Color = "#00BCD4", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
        new Category { Name = "Giáo dục", Icon = "📚", Color = "#3F51B5", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
        new Category { Name = "Tiền nhà", Icon = "🏠", Color = "#795548", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
        new Category { Name = "Đi lại", Icon = "🚗", Color = "#607D8B", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
        new Category { Name = "Cưới hỏi tiệc tùng", Icon = "💍", Color = "#FF4081", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
        new Category { Name = "Điện / Nước / Internet", Icon = "⚡", Color = "#FFC107", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
        new Category { Name = "Giải trí", Icon = "🎮", Color = "#00E676", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now }
    );

    await db.SaveChangesAsync();
}

static async Task SeedDemoDataAsync(AppDbContext db)
{
    var categories = await db.Categories.ToDictionaryAsync(x => x.Name);
    var now = DateTime.UtcNow;

    if (!await db.Transactions.AnyAsync())
    {
        db.Transactions.AddRange(
            new Transaction { Id = Guid.NewGuid(), Title = "Lương tháng này", Amount = 15_000_000, Type = TransactionType.Income, CategoryId = categories["Lương"].Id, Date = UtcDate(now.Year, now.Month, 1) },
            new Transaction { Id = Guid.NewGuid(), Title = "Tiền nhà", Amount = 3_500_000, Type = TransactionType.Expense, CategoryId = categories["Tiền nhà"].Id, Date = UtcDate(now.Year, now.Month, 2) },
            new Transaction { Id = Guid.NewGuid(), Title = "Ăn sáng + trưa", Amount = 250_000, Type = TransactionType.Expense, CategoryId = categories["Ăn uống"].Id, Date = UtcDate(now.Year, now.Month, 5) },
            new Transaction { Id = Guid.NewGuid(), Title = "Thu nhập freelance", Amount = 5_000_000, Type = TransactionType.Income, CategoryId = categories["Thu nhập phụ"].Id, Date = UtcDate(now.Year, now.Month, 10) },
            new Transaction { Id = Guid.NewGuid(), Title = "Mua quần áo", Amount = 800_000, Type = TransactionType.Expense, CategoryId = categories["Quần áo"].Id, Date = UtcDate(now.Year, now.Month, 12) },
            new Transaction { Id = Guid.NewGuid(), Title = "Khám sức khỏe", Amount = 300_000, Type = TransactionType.Expense, CategoryId = categories["Y tế"].Id, Date = UtcDate(now.Year, now.Month, 15) },
            new Transaction { Id = Guid.NewGuid(), Title = "Điện nước internet", Amount = 450_000, Type = TransactionType.Expense, CategoryId = categories["Điện / Nước / Internet"].Id, Date = UtcDate(now.Year, now.Month, 16) },
            new Transaction { Id = Guid.NewGuid(), Title = "Grab + xăng", Amount = 350_000, Type = TransactionType.Expense, CategoryId = categories["Đi lại"].Id, Date = UtcDate(now.Year, now.Month, 17) }
        );
        await db.SaveChangesAsync();
    }

    if (!await db.Debts.AnyAsync())
    {
        db.Debts.AddRange(
            new Debt { Id = Guid.NewGuid(), Title = "Vay tiền mua xe máy", PersonName = "Anh Minh", OriginalAmount = 10_000_000, RemainingAmount = 7_000_000, Type = DebtType.Borrowed, Status = DebtStatus.PartiallyPaid, DueDate = now.AddMonths(3), CreatedAt = now },
            new Debt { Id = Guid.NewGuid(), Title = "Cho bạn mượn đi du lịch", PersonName = "Chị Lan", OriginalAmount = 3_000_000, RemainingAmount = 3_000_000, Type = DebtType.Lent, Status = DebtStatus.Unpaid, DueDate = now.AddMonths(1), CreatedAt = now }
        );
        await db.SaveChangesAsync();
    }

    if (!await db.SavingsAccounts.AnyAsync())
    {
        var savingsId = Guid.NewGuid();
        var stockId = Guid.NewGuid();

        db.SavingsAccounts.AddRange(
            new SavingsAccount { Id = savingsId, Name = "Tiết kiệm VCB 6 tháng", Type = SavingsType.Savings, InitialAmount = 50_000_000, TotalDeposited = 50_000_000, CurrentValue = 51_250_000, InterestRate = 5.5m, StartDate = now.AddMonths(-3), MaturityDate = now.AddMonths(3), Status = SavingsStatus.Active, CreatedAt = now.AddMonths(-3) },
            new SavingsAccount { Id = stockId, Name = "Danh mục chứng khoán", Type = SavingsType.Stock, InitialAmount = 20_000_000, TotalDeposited = 25_000_000, CurrentValue = 28_500_000, StartDate = now.AddMonths(-6), Status = SavingsStatus.Active, CreatedAt = now.AddMonths(-6) }
        );
        await db.SaveChangesAsync();

        db.SavingsHistories.AddRange(
            new SavingsHistory { Id = Guid.NewGuid(), SavingsAccountId = savingsId, TransactionType = SavingsTransactionType.Deposit, Amount = 50_000_000, PreviousValue = 0, NewValue = 50_000_000, Note = "Nạp vốn ban đầu", Date = now.AddMonths(-3), CreatedAt = now.AddMonths(-3) },
            new SavingsHistory { Id = Guid.NewGuid(), SavingsAccountId = savingsId, TransactionType = SavingsTransactionType.InterestReceived, Amount = 1_250_000, PreviousValue = 50_000_000, NewValue = 51_250_000, Note = "Lãi tháng 1", Date = now.AddMonths(-1), CreatedAt = now.AddMonths(-1) },
            new SavingsHistory { Id = Guid.NewGuid(), SavingsAccountId = stockId, TransactionType = SavingsTransactionType.Deposit, Amount = 20_000_000, PreviousValue = 0, NewValue = 20_000_000, Note = "Nạp vốn ban đầu", Date = now.AddMonths(-6), CreatedAt = now.AddMonths(-6) },
            new SavingsHistory { Id = Guid.NewGuid(), SavingsAccountId = stockId, TransactionType = SavingsTransactionType.ValueUpdate, Amount = 0, PreviousValue = 25_000_000, NewValue = 28_500_000, Note = "Tăng 3,500,000đ (+14%)", Date = now.AddDays(-7), CreatedAt = now.AddDays(-7) }
        );
        await db.SaveChangesAsync();
    }

    if (!await db.Budgets.AnyAsync())
    {
        db.Budgets.AddRange(
            new Budget { Id = Guid.NewGuid(), CategoryId = categories["Ăn uống"].Id, Year = now.Year, Month = now.Month, PlannedAmount = 2_000_000, Note = "Ăn uống tháng này", CreatedAt = now },
            new Budget { Id = Guid.NewGuid(), CategoryId = categories["Tiền nhà"].Id, Year = now.Year, Month = now.Month, PlannedAmount = 4_000_000, Note = "Tiền thuê nhà", CreatedAt = now },
            new Budget { Id = Guid.NewGuid(), CategoryId = categories["Đi lại"].Id, Year = now.Year, Month = now.Month, PlannedAmount = 500_000, Note = "Xăng xe + grab", CreatedAt = now },
            new Budget { Id = Guid.NewGuid(), CategoryId = categories["Điện / Nước / Internet"].Id, Year = now.Year, Month = now.Month, PlannedAmount = 600_000, Note = "Điện nước internet", CreatedAt = now },
            new Budget { Id = Guid.NewGuid(), CategoryId = categories["Quần áo"].Id, Year = now.Year, Month = now.Month, PlannedAmount = 500_000, Note = "Quần áo", CreatedAt = now },
            new Budget { Id = Guid.NewGuid(), CategoryId = categories["Y tế"].Id, Year = now.Year, Month = now.Month, PlannedAmount = 500_000, Note = "Khám sức khỏe", CreatedAt = now },
            new Budget { Id = Guid.NewGuid(), CategoryId = categories["Chi tiêu hàng ngày"].Id, Year = now.Year, Month = now.Month, PlannedAmount = 800_000, Note = "Chi tiêu lặt vặt", CreatedAt = now }
        );
        await db.SaveChangesAsync();
    }
}
