namespace ExpenseTracker.Domain.Entities;

public class DebtPayment : IUserOwnedEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid DebtId { get; set; }
    public Debt? Debt { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaidDate { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
