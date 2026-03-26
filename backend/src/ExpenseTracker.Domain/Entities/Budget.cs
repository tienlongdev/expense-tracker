namespace ExpenseTracker.Domain.Entities;

public class Budget : IUserOwnedEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal PlannedAmount { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
