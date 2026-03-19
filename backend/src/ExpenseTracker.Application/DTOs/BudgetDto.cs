using ExpenseTracker.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Application.DTOs;

// ── Response ─────────────────────────────────────────────────────────

public class BudgetDto
{
    public Guid     Id             { get; set; }
    public Guid     CategoryId     { get; set; }
    public string   CategoryName   { get; set; } = string.Empty;
    public string?  CategoryIcon   { get; set; }
    public string?  CategoryColor  { get; set; }
    public int      Year           { get; set; }
    public int      Month          { get; set; }
    public string   MonthName      => new DateTime(Year, Month, 1).ToString("MM/yyyy");
    public decimal  PlannedAmount  { get; set; }
    public string?  Note           { get; set; }
    public DateTime CreatedAt      { get; set; }
}

/// <summary>Trạng thái ngân sách 1 category trong 1 tháng (có cả thực chi)</summary>
public class BudgetStatusDto
{
    // ── Category ──────────────────────────────────────────
    public Guid    CategoryId    { get; set; }
    public string  CategoryName  { get; set; } = string.Empty;
    public string? CategoryIcon  { get; set; }
    public string? CategoryColor { get; set; }

    // ── Budget ────────────────────────────────────────────
    public Guid?   BudgetId      { get; set; }
    public bool    HasBudget     => BudgetId.HasValue;
    public decimal PlannedAmount { get; set; }

    // ── Thực chi (từ Transactions) ────────────────────────
    public decimal SpentAmount   { get; set; }

    // ── Computed ──────────────────────────────────────────
    public decimal RemainingAmount => PlannedAmount - SpentAmount;

    public decimal UsedPercent => PlannedAmount == 0 ? 0
        : Math.Round(SpentAmount / PlannedAmount * 100, 1);

    /// <summary>Đã vượt ngân sách</summary>
    public bool IsOverBudget  => HasBudget && SpentAmount > PlannedAmount;

    /// <summary>Sắp hết ngân sách (≥ 80% nhưng chưa vượt)</summary>
    public bool IsNearLimit   => HasBudget && UsedPercent >= 80 && !IsOverBudget;

    /// <summary>Có chi tiêu nhưng chưa đặt ngân sách</summary>
    public bool IsNoBudget    => !HasBudget && SpentAmount > 0;
}

/// <summary>Tổng quan ngân sách 1 tháng — tất cả categories</summary>
public class BudgetOverviewDto
{
    public int    Year           { get; set; }
    public int    Month          { get; set; }
    public string MonthName      => new DateTime(Year, Month, 1).ToString("MMMM yyyy");

    // ── Tổng hợp ──────────────────────────────────────────
    public decimal TotalPlanned  { get; set; }
    public decimal TotalSpent    { get; set; }
    public decimal TotalRemaining => TotalPlanned - TotalSpent;
    public decimal UsedPercent   => TotalPlanned == 0 ? 0
        : Math.Round(TotalSpent / TotalPlanned * 100, 1);

    // ── Thống kê nhanh ────────────────────────────────────
    public int OverBudgetCount   { get; set; }  // số category vượt ngân sách
    public int NearLimitCount    { get; set; }  // số category sắp hết
    public int OnTrackCount      { get; set; }  // số category trong ngân sách
    public int NoBudgetCount     { get; set; }  // số category chi nhưng chưa đặt ns

    public List<BudgetStatusDto> Categories { get; set; } = [];
}

/// <summary>Tóm tắt ngân sách 1 tháng trong overview cả năm</summary>
public class MonthlyBudgetSummaryDto
{
    public int     Year           { get; set; }
    public int     Month          { get; set; }
    public string  MonthName      => new DateTime(Year, Month, 1).ToString("MM/yyyy");
    public decimal TotalPlanned   { get; set; }
    public decimal TotalSpent     { get; set; }
    public decimal TotalRemaining => TotalPlanned - TotalSpent;
    public decimal UsedPercent    => TotalPlanned == 0 ? 0
        : Math.Round(TotalSpent / TotalPlanned * 100, 1);
    public bool    IsOverBudget   => TotalSpent > TotalPlanned && TotalPlanned > 0;
    public int     BudgetCount    { get; set; }  // số category đã đặt ns
    public int     OverBudgetCount { get; set; }
}

// ── Request ──────────────────────────────────────────────────────────

public class CreateBudgetDto
{
    [Required(ErrorMessage = "Vui lòng chọn danh mục")]
    public Guid CategoryId { get; set; }

    [Required]
    [Range(2000, 2100, ErrorMessage = "Năm không hợp lệ")]
    public int Year { get; set; }

    [Required]
    [Range(1, 12, ErrorMessage = "Tháng phải từ 1 đến 12")]
    public int Month { get; set; }

    [Required]
    [Range(1000, double.MaxValue, ErrorMessage = "Ngân sách phải lớn hơn 0")]
    public decimal PlannedAmount { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}

public class UpdateBudgetDto
{
    [Range(1000, double.MaxValue, ErrorMessage = "Ngân sách phải lớn hơn 0")]
    public decimal? PlannedAmount { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}

/// <summary>Tạo/cập nhật nhiều ngân sách cùng lúc cho 1 tháng</summary>
public class BulkUpsertBudgetDto
{
    [Required]
    [Range(2000, 2100)]
    public int Year { get; set; }

    [Required]
    [Range(1, 12)]
    public int Month { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "Cần ít nhất 1 ngân sách")]
    public List<BudgetItemDto> Items { get; set; } = [];
}

public class BudgetItemDto
{
    [Required]
    public Guid CategoryId { get; set; }

    [Required]
    [Range(1000, double.MaxValue)]
    public decimal PlannedAmount { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}

/// <summary>Sao chép toàn bộ ngân sách từ tháng nguồn sang tháng đích</summary>
public class CopyBudgetDto
{
    [Required]
    [Range(2000, 2100)]
    public int FromYear { get; set; }

    [Required]
    [Range(1, 12)]
    public int FromMonth { get; set; }

    [Required]
    [Range(2000, 2100)]
    public int ToYear { get; set; }

    [Required]
    [Range(1, 12)]
    public int ToMonth { get; set; }

    /// <summary>true = ghi đè nếu đã có ngân sách ở tháng đích</summary>
    public bool Overwrite { get; set; } = false;
}