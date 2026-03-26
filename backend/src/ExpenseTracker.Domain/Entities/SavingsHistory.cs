using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Domain.Entities;

public class SavingsHistory : IUserOwnedEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid SavingsAccountId { get; set; }
    public SavingsAccount? SavingsAccount { get; set; }
    public SavingsTransactionType TransactionType { get; set; }
    public decimal Amount { get; set; }
    public decimal PreviousValue { get; set; }
    public decimal NewValue { get; set; }
    public decimal ProfitLoss => NewValue - PreviousValue;
    public string? Note { get; set; }
    public DateTime Date { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
