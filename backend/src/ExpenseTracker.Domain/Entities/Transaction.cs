using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Domain.Entities;

public class Transaction : IUserOwnedEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }
    public DateTime Date { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
