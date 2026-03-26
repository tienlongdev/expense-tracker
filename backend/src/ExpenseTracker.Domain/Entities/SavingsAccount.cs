using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Domain.Entities;

public class SavingsAccount : IUserOwnedEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Name { get; set; } = string.Empty;
    public SavingsType Type { get; set; }
    public decimal InitialAmount { get; set; }
    public decimal TotalDeposited { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal? InterestRate { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? MaturityDate { get; set; }
    public SavingsStatus Status { get; set; } = SavingsStatus.Active;
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public ICollection<SavingsHistory> History { get; set; } = [];
}
