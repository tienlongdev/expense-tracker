using ExpenseTracker.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Application.DTOs;

// ── Response ─────────────────────────────────────────────

public class DebtDto
{
    public Guid       Id              { get; set; }
    public string     Title           { get; set; } = string.Empty;
    public string     PersonName      { get; set; } = string.Empty;
    public decimal    OriginalAmount  { get; set; }
    public decimal    RemainingAmount { get; set; }
    public decimal    PaidAmount      => OriginalAmount - RemainingAmount;
    public double     PaidPercent     => OriginalAmount == 0 ? 0 : Math.Round((double)(PaidAmount / OriginalAmount) * 100, 1);
    public DebtType   Type            { get; set; }
    public string     TypeName        => Type == DebtType.Borrowed ? "Bạn đang vay" : "Bạn cho mượn";
    public DebtStatus Status          { get; set; }
    public string     StatusName      => Status switch
    {
        DebtStatus.Unpaid        => "Chưa trả",
        DebtStatus.PartiallyPaid => "Trả một phần",
        DebtStatus.Paid          => "Đã trả hết",
        _                        => string.Empty
    };
    public bool       IsOverdue       => DueDate.HasValue && DueDate.Value < DateTime.UtcNow && Status != DebtStatus.Paid;
    public DateTime?  DueDate         { get; set; }
    public string?    Note            { get; set; }
    public DateTime   CreatedAt       { get; set; }
}

public class DebtPaymentDto
{
    public Guid     Id       { get; set; }
    public Guid     DebtId   { get; set; }
    public decimal  Amount   { get; set; }
    public DateTime PaidDate { get; set; }
    public string?  Note     { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class DebtSummaryDto
{
    /// <summary>Tổng nợ bạn đang vay</summary>
    public decimal TotalBorrowed          { get; set; }
    /// <summary>Còn lại phải trả</summary>
    public decimal TotalBorrowedRemaining { get; set; }

    /// <summary>Tổng bạn cho mượn</summary>
    public decimal TotalLent              { get; set; }
    /// <summary>Còn lại chưa thu về</summary>
    public decimal TotalLentRemaining     { get; set; }

    /// <summary>Số khoản quá hạn</summary>
    public int OverdueCount { get; set; }
}

// ── Request ──────────────────────────────────────────────

public class CreateDebtDto
{
    [Required(ErrorMessage = "Tiêu đề không được để trống")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên người liên quan không được để trống")]
    [MaxLength(100)]
    public string PersonName { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Số tiền phải lớn hơn 0")]
    public decimal OriginalAmount { get; set; }

    [Required]
    public DebtType Type { get; set; }

    public DateTime? DueDate { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}

public class UpdateDebtDto
{
    [MaxLength(200)]
    public string? Title { get; set; }

    [MaxLength(100)]
    public string? PersonName { get; set; }

    public DateTime? DueDate { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}

public class CreateDebtPaymentDto
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Số tiền thanh toán phải lớn hơn 0")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime PaidDate { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}