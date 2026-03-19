using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Application.Services;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;
using ExpenseTracker.Infrastructure.Data;
using ExpenseTracker.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 10,
            maxRetryDelay: TimeSpan.FromSeconds(15),
            errorNumbersToAdd: null
        )
    )
);

// DI — Repositories
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();

// DI — Services
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// ========================
// Auto Migrate + Seed
// ========================
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate(); // dùng Migrate() thay EnsureCreated()

    // ---- Seed Categories (tiếng Việt) ----
    if (!db.Categories.Any())
    {
        var categories = new List<Category>
        {
            // ── Thu nhập ──────────────────────────────────────
            new() { Id = new Guid("10000000-0000-0000-0000-000000000001"), Name = "Lương",             Icon = "💰", Color = "#4CAF50", Type = TransactionType.Income,  IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("10000000-0000-0000-0000-000000000002"), Name = "Thu nhập phụ",      Icon = "💵", Color = "#8BC34A", Type = TransactionType.Income,  IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("10000000-0000-0000-0000-000000000003"), Name = "Đầu tư",            Icon = "📈", Color = "#2196F3", Type = TransactionType.Income,  IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("10000000-0000-0000-0000-000000000004"), Name = "Quà tặng / Thưởng", Icon = "🎁", Color = "#9C27B0", Type = TransactionType.Income,  IsDefault = true, CreatedAt = DateTime.UtcNow },

            // ── Chi tiêu ──────────────────────────────────────
            new() { Id = new Guid("20000000-0000-0000-0000-000000000001"), Name = "Ăn uống",               Icon = "🍜", Color = "#FF5722", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000002"), Name = "Chi tiêu hàng ngày",    Icon = "🛒", Color = "#FF9800", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000003"), Name = "Quần áo",               Icon = "👗", Color = "#E91E63", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000004"), Name = "Mỹ phẩm",               Icon = "💄", Color = "#F06292", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000005"), Name = "Phí giao lưu",          Icon = "🎉", Color = "#BA68C8", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000006"), Name = "Y tế",                  Icon = "🏥", Color = "#00BCD4", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000007"), Name = "Giáo dục",              Icon = "📚", Color = "#3F51B5", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000008"), Name = "Tiền nhà",              Icon = "🏠", Color = "#795548", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000009"), Name = "Đi lại",                Icon = "🚗", Color = "#607D8B", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000010"), Name = "Cưới hỏi tiệc tùng",   Icon = "💒", Color = "#FF4081", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000011"), Name = "Điện / Nước / Internet", Icon = "⚡", Color = "#FFC107", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
            new() { Id = new Guid("20000000-0000-0000-0000-000000000012"), Name = "Giải trí",              Icon = "🎮", Color = "#00E676", Type = TransactionType.Expense, IsDefault = true, CreatedAt = DateTime.UtcNow },
        };

        db.Categories.AddRange(categories);
        db.SaveChanges();

        // ---- Seed Transactions ----
        if (!db.Transactions.Any())
        {
            var now = DateTime.UtcNow;
            db.Transactions.AddRange(
                new Transaction { Id = Guid.NewGuid(), Title = "Lương tháng 3", Amount = 15_000_000, Type = TransactionType.Income, CategoryId = new Guid("10000000-0000-0000-0000-000000000001"), Date = new DateTime(now.Year, now.Month, 1), Note = "Lương tháng 3/2026" },
                new Transaction { Id = Guid.NewGuid(), Title = "Tiền nhà tháng 3", Amount = 3_500_000, Type = TransactionType.Expense, CategoryId = new Guid("20000000-0000-0000-0000-000000000008"), Date = new DateTime(now.Year, now.Month, 2), Note = "Thuê căn hộ" },
                new Transaction { Id = Guid.NewGuid(), Title = "Ăn sáng + trưa", Amount = 250_000, Type = TransactionType.Expense, CategoryId = new Guid("20000000-0000-0000-0000-000000000001"), Date = new DateTime(now.Year, now.Month, 5), Note = "Cơm văn phòng" },
                new Transaction { Id = Guid.NewGuid(), Title = "Thu nhập freelance", Amount = 5_000_000, Type = TransactionType.Income, CategoryId = new Guid("10000000-0000-0000-0000-000000000002"), Date = new DateTime(now.Year, now.Month, 10), Note = "Project web design" },
                new Transaction { Id = Guid.NewGuid(), Title = "Mua quần áo", Amount = 800_000, Type = TransactionType.Expense, CategoryId = new Guid("20000000-0000-0000-0000-000000000003"), Date = new DateTime(now.Year, now.Month, 12), Note = "Áo khoác mùa đông" },
                new Transaction { Id = Guid.NewGuid(), Title = "Khám sức khoẻ", Amount = 300_000, Type = TransactionType.Expense, CategoryId = new Guid("20000000-0000-0000-0000-000000000006"), Date = new DateTime(now.Year, now.Month, 15), Note = "Khám định kỳ" },
                new Transaction { Id = Guid.NewGuid(), Title = "Học phí khoá học", Amount = 1_200_000, Type = TransactionType.Expense, CategoryId = new Guid("20000000-0000-0000-0000-000000000007"), Date = new DateTime(now.Year, now.Month, 18), Note = "Khóa học lập trình" }
            );
            db.SaveChanges();
        }
    }
}

// ========================
// Middleware Pipeline
// ========================
if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.Run();