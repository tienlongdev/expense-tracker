using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Domain.Entities;

public class Category
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Icon { get; set; }   // emoji: "🍜"

    public string? Color { get; set; }  // hex: "#FF5722"

    public TransactionType Type { get; set; } // Income | Expense

    public bool IsDefault { get; set; } // true = seeded, không xoá được

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<Transaction> Transactions { get; set; } = [];
}