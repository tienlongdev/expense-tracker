using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Domain.Entities;

public class SavingsHistory
{
    public Guid Id { get; set; }

    public Guid SavingsAccountId { get; set; }
    public SavingsAccount? SavingsAccount { get; set; }

    public SavingsTransactionType TransactionType { get; set; }

    /// <summary>Số tiền nạp/rút/lãi nhận được. Bằng 0 nếu chỉ cập nhật giá trị.</summary>
    public decimal Amount { get; set; }

    /// <summary>Giá trị tài khoản trước khi thay đổi</summary>
    public decimal PreviousValue { get; set; }

    /// <summary>Giá trị tài khoản sau khi thay đổi</summary>
    public decimal NewValue { get; set; }

    /// <summary>Lời/lỗ so với lần trước (NewValue - PreviousValue)</summary>
    public decimal ProfitLoss => NewValue - PreviousValue;

    public string? Note { get; set; }

    public DateTime Date      { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}