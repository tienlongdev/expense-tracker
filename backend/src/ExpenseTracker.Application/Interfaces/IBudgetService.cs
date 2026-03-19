using ExpenseTracker.Application.DTOs;

namespace ExpenseTracker.Application.Interfaces;

public interface IBudgetService
{
    // CRUD
    Task<IEnumerable<BudgetDto>> GetByMonthAsync(int year, int month);
    Task<BudgetDto?> GetByIdAsync(Guid id);
    Task<BudgetDto>  CreateAsync(CreateBudgetDto dto);
    Task<BudgetDto?> UpdateAsync(Guid id, UpdateBudgetDto dto);
    Task<bool>       DeleteAsync(Guid id);

    // Overview
    Task<BudgetOverviewDto>                  GetOverviewAsync(int year, int month);
    Task<IEnumerable<MonthlyBudgetSummaryDto>> GetYearlyOverviewAsync(int year);

    // Bulk
    Task<IEnumerable<BudgetDto>> BulkUpsertAsync(BulkUpsertBudgetDto dto);
    Task<CopyBudgetResultDto>    CopyFromMonthAsync(CopyBudgetDto dto);
}

public class CopyBudgetResultDto
{
    public int Created  { get; set; }
    public int Skipped  { get; set; }
    public int Overwritten { get; set; }
    public string Message => $"Đã tạo {Created}, bỏ qua {Skipped}, ghi đè {Overwritten} ngân sách.";
}