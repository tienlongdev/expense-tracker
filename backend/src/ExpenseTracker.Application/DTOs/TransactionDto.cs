using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Application.DTOs;

// Response DTO — trả về client
public class TransactionDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public string TypeName => Type.ToString(); // "Income" / "Expense"
    public string Category { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
}