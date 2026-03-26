using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Domain.Entities;

public class Category : IUserOwnedEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public TransactionType Type { get; set; }
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = [];
}
