using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Application.Services;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;
using ExpenseTracker.Infrastructure.Data;
using ExpenseTracker.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ========================
// Services
// ========================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// Repository + Service
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<ITransactionService, TransactionService>();

// CORS
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
// Auto Migration + Seed
// ========================
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Auto apply migration
    db.Database.Migrate();

    // Seed data nếu chưa có
    if (!db.Transactions.Any())
    {
        var now = DateTime.UtcNow;

        db.Transactions.AddRange(
            new Transaction
            {
                Id = Guid.NewGuid(),
                Title = "Monthly Salary",
                Amount = 15000000,
                Type = TransactionType.Income,
                Category = "Salary",
                Date = new DateTime(now.Year, now.Month, 1),
                Note = "March salary"
            },
            new Transaction
            {
                Id = Guid.NewGuid(),
                Title = "Rent",
                Amount = 3500000,
                Type = TransactionType.Expense,
                Category = "Housing",
                Date = new DateTime(now.Year, now.Month, 2),
                Note = "Monthly rent"
            },
            new Transaction
            {
                Id = Guid.NewGuid(),
                Title = "Groceries",
                Amount = 800000,
                Type = TransactionType.Expense,
                Category = "Food",
                Date = new DateTime(now.Year, now.Month, 5),
                Note = "Weekly groceries"
            },
            new Transaction
            {
                Id = Guid.NewGuid(),
                Title = "Freelance Project",
                Amount = 5000000,
                Type = TransactionType.Income,
                Category = "Freelance",
                Date = new DateTime(now.Year, now.Month, 10),
                Note = "Web design project"
            },
            new Transaction
            {
                Id = Guid.NewGuid(),
                Title = "Electric Bill",
                Amount = 450000,
                Type = TransactionType.Expense,
                Category = "Utilities",
                Date = new DateTime(now.Year, now.Month, 15),
                Note = "Monthly electric bill"
            }
        );

        db.SaveChanges();
    }
}

// ========================
// Middleware
// ========================
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();