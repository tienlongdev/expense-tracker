using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Domain.Entities;

public class SavingsAccount
{
    public Guid Id { get; set; }

    /// <summary>Tên tài khoản/khoản đầu tư. VD: "Tiết kiệm VCB", "Cổ phiếu VNM"</summary>
    public string Name { get; set; } = string.Empty;

    public SavingsType Type { get; set; }

    // ── Tài chính ─────────────────────────────────────────
    /// <summary>Vốn bỏ vào lần đầu</summary>
    public decimal InitialAmount { get; set; }

    /// <summary>Tổng vốn đã nạp (InitialAmount + tất cả Deposit)</summary>
    public decimal TotalDeposited { get; set; }

    /// <summary>Giá trị hiện tại (cập nhật thủ công hoặc tính lãi)</summary>
    public decimal CurrentValue { get; set; }

    /// <summary>Lãi suất %/năm — chỉ dùng cho Savings</summary>
    public decimal? InterestRate { get; set; }

    // ── Thời gian ─────────────────────────────────────────
    public DateTime StartDate { get; set; }

    /// <summary>Ngày đáo hạn (nullable — đầu tư không có hạn)</summary>
    public DateTime? MaturityDate { get; set; }

    // ── Trạng thái ────────────────────────────────────────
    public SavingsStatus Status { get; set; } = SavingsStatus.Active;

    public string? Note { get; set; }

    public DateTime CreatedAt  { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<SavingsHistory> History { get; set; } = [];
}