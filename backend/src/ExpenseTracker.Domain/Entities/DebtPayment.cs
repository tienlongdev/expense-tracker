namespace ExpenseTracker.Domain.Entities;

public class DebtPayment
{
    public Guid Id { get; set; }

    public Guid DebtId { get; set; }
    public Debt? Debt { get; set; }

    public decimal Amount { get; set; }

    public DateTime PaidDate { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}