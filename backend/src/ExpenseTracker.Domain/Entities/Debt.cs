using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Domain.Entities;

public class Debt : IUserOwnedEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Title { get; set; } = string.Empty;
    public string PersonName { get; set; } = string.Empty;
    public decimal OriginalAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public DebtType Type { get; set; }
    public DebtStatus Status { get; set; } = DebtStatus.Unpaid;
    public DateTime? DueDate { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public ICollection<DebtPayment> Payments { get; set; } = [];
}
