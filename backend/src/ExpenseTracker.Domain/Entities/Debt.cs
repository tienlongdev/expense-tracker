using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Domain.Entities;

public class Debt
{
    public Guid Id { get; set; }

    /// <summary>Mô tả khoản nợ. VD: "Vay tiền mua xe"</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Tên người liên quan (chủ nợ hoặc con nợ)</summary>
    public string PersonName { get; set; } = string.Empty;

    /// <summary>Số tiền gốc ban đầu</summary>
    public decimal OriginalAmount { get; set; }

    /// <summary>Số tiền còn lại chưa trả / chưa thu</summary>
    public decimal RemainingAmount { get; set; }

    /// <summary>Borrowed = bạn vay | Lent = bạn cho mượn</summary>
    public DebtType Type { get; set; }

    public DebtStatus Status { get; set; } = DebtStatus.Unpaid;

    /// <summary>Hạn trả nợ (nếu có)</summary>
    public DateTime? DueDate { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<DebtPayment> Payments { get; set; } = [];
}