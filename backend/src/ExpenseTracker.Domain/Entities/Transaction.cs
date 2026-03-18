using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Domain.Entities;

public class Transaction
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public TransactionType Type { get; set; }

    public string Category { get; set; } = string.Empty;

    public DateTime Date { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}