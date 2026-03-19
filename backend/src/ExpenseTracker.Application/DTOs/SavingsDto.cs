using ExpenseTracker.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Application.DTOs;

// ── Response ─────────────────────────────────────────────────────────

public class SavingsAccountDto
{
    public Guid          Id             { get; set; }
    public string        Name           { get; set; } = string.Empty;
    public SavingsType   Type           { get; set; }
    public string        TypeName       => Type switch
    {
        SavingsType.Savings    => "Tiết kiệm",
        SavingsType.Stock      => "Chứng khoán",
        SavingsType.Gold       => "Vàng",
        SavingsType.Crypto     => "Tiền điện tử",
        SavingsType.RealEstate => "Bất động sản",
        SavingsType.Fund       => "Quỹ đầu tư",
        _                      => "Khác"
    };

    // ── Tài chính ──────────────────────────────────────
    public decimal  InitialAmount  { get; set; }
    public decimal  TotalDeposited { get; set; }
    public decimal  CurrentValue   { get; set; }

    /// <summary>Lời/lỗ = Giá trị hiện tại - Tổng vốn đã nạp</summary>
    public decimal  ProfitLoss     => CurrentValue - TotalDeposited;

    /// <summary>% Lời/lỗ so với tổng vốn</summary>
    public decimal  ProfitPercent  => TotalDeposited == 0 ? 0
        : Math.Round(ProfitLoss / TotalDeposited * 100, 2);

    public bool     IsProfit       => ProfitLoss >= 0;

    public decimal? InterestRate   { get; set; }

    // ── Thời gian ──────────────────────────────────────
    public DateTime  StartDate    { get; set; }
    public DateTime? MaturityDate { get; set; }
    public bool      IsMatured    => MaturityDate.HasValue && MaturityDate.Value <= DateTime.UtcNow;

    /// <summary>Số ngày còn lại đến đáo hạn</summary>
    public int? DaysToMaturity => MaturityDate.HasValue
        ? Math.Max(0, (int)(MaturityDate.Value - DateTime.UtcNow).TotalDays)
        : null;

    // ── Trạng thái ─────────────────────────────────────
    public SavingsStatus Status     { get; set; }
    public string        StatusName => Status switch
    {
        SavingsStatus.Active  => "Đang hoạt động",
        SavingsStatus.Matured => "Đáo hạn",
        SavingsStatus.Closed  => "Đã đóng",
        _                     => string.Empty
    };

    public string?   Note      { get; set; }
    public DateTime  CreatedAt { get; set; }
}

public class SavingsHistoryDto
{
    public Guid                    Id              { get; set; }
    public Guid                    SavingsAccountId { get; set; }
    public SavingsTransactionType  TransactionType  { get; set; }
    public string                  TransactionTypeName => TransactionType switch
    {
        SavingsTransactionType.Deposit          => "Nạp vốn",
        SavingsTransactionType.Withdrawal       => "Rút vốn",
        SavingsTransactionType.ValueUpdate      => "Cập nhật giá trị",
        SavingsTransactionType.InterestReceived => "Nhận lãi",
        _                                       => string.Empty
    };
    public decimal  Amount        { get; set; }
    public decimal  PreviousValue { get; set; }
    public decimal  NewValue      { get; set; }
    public decimal  ProfitLoss    => NewValue - PreviousValue;
    public bool     IsProfit      => ProfitLoss >= 0;
    public string?  Note          { get; set; }
    public DateTime Date          { get; set; }
    public DateTime CreatedAt     { get; set; }
}

public class SavingsSummaryDto
{
    public decimal TotalDeposited    { get; set; }
    public decimal TotalCurrentValue { get; set; }
    public decimal TotalProfitLoss   => TotalCurrentValue - TotalDeposited;
    public decimal TotalProfitPercent => TotalDeposited == 0 ? 0
        : Math.Round(TotalProfitLoss / TotalDeposited * 100, 2);
    public bool    IsProfit          => TotalProfitLoss >= 0;
    public int     ActiveCount       { get; set; }
    public int     MaturedCount      { get; set; }
    public int     ClosedCount       { get; set; }
    public List<SavingsByTypeDto> ByType { get; set; } = [];
}

public class SavingsByTypeDto
{
    public SavingsType Type           { get; set; }
    public string      TypeName       { get; set; } = string.Empty;
    public int         Count          { get; set; }
    public decimal     TotalDeposited { get; set; }
    public decimal     CurrentValue   { get; set; }
    public decimal     ProfitLoss     => CurrentValue - TotalDeposited;
}

// ── Request ──────────────────────────────────────────────────────────

public class CreateSavingsAccountDto
{
    [Required(ErrorMessage = "Tên không được để trống")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public SavingsType Type { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Vốn ban đầu phải lớn hơn 0")]
    public decimal InitialAmount { get; set; }

    [Range(0, 100, ErrorMessage = "Lãi suất phải từ 0 đến 100")]
    public decimal? InterestRate { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    public DateTime? MaturityDate { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}

public class UpdateSavingsAccountDto
{
    [MaxLength(200)]
    public string? Name { get; set; }

    [Range(0, 100)]
    public decimal? InterestRate { get; set; }

    public DateTime? MaturityDate { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}

/// <summary>Nạp thêm vốn vào tài khoản</summary>
public class SavingsDepositDto
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Số tiền phải lớn hơn 0")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}

/// <summary>Rút vốn khỏi tài khoản</summary>
public class SavingsWithdrawDto
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Số tiền phải lớn hơn 0")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}

/// <summary>Cập nhật giá trị hiện tại → tự động tính lời/lỗ</summary>
public class UpdateSavingsValueDto
{
    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Giá trị không được âm")]
    public decimal NewValue { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}

/// <summary>Ghi nhận nhận lãi suất</summary>
public class SavingsInterestDto
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Số tiền lãi phải lớn hơn 0")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}


// DTO nhỏ cho close
public record CloseAccountDto([MaxLength(500)] string? Note);