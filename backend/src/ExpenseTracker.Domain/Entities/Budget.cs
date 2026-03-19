namespace ExpenseTracker.Domain.Entities;

public class Budget
{
    public Guid Id { get; set; }

    // FK → Category
    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }

    /// <summary>Năm áp dụng. VD: 2026</summary>
    public int Year { get; set; }

    /// <summary>Tháng áp dụng (1–12)</summary>
    public int Month { get; set; }

    /// <summary>Ngân sách đặt ra cho tháng này</summary>
    public decimal PlannedAmount { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedAt  { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}