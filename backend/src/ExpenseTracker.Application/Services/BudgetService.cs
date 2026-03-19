using ExpenseTracker.Application.DTOs;
using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;

namespace ExpenseTracker.Application.Services;

public class BudgetService : IBudgetService
{
    private readonly IBudgetRepository   _budgetRepo;
    private readonly ICategoryRepository _categoryRepo;

    public BudgetService(IBudgetRepository budgetRepo, ICategoryRepository categoryRepo)
    {
        _budgetRepo   = budgetRepo;
        _categoryRepo = categoryRepo;
    }

    // ========================
    // CRUD
    // ========================

    public async Task<IEnumerable<BudgetDto>> GetByMonthAsync(int year, int month)
    {
        var budgets = await _budgetRepo.GetByMonthAsync(year, month);
        return budgets.Select(MapToDto);
    }

    public async Task<BudgetDto?> GetByIdAsync(Guid id)
    {
        var budget = await _budgetRepo.GetByIdAsync(id);
        return budget is null ? null : MapToDto(budget);
    }

    public async Task<BudgetDto> CreateAsync(CreateBudgetDto dto)
    {
        // Validate category tồn tại
        var category = await _categoryRepo.GetByIdAsync(dto.CategoryId)
            ?? throw new KeyNotFoundException($"Không tìm thấy danh mục {dto.CategoryId}");

        if (category.Type != TransactionType.Expense)
            throw new InvalidOperationException("Chỉ có thể đặt ngân sách cho danh mục Chi tiêu.");

        // Unique: 1 category chỉ có 1 ngân sách mỗi tháng
        if (await _budgetRepo.ExistsAsync(dto.CategoryId, dto.Year, dto.Month))
            throw new InvalidOperationException(
                $"Danh mục '{category.Name}' đã có ngân sách tháng {dto.Month}/{dto.Year}. Hãy dùng PUT để cập nhật.");

        var budget = new Budget
        {
            CategoryId    = dto.CategoryId,
            Year          = dto.Year,
            Month         = dto.Month,
            PlannedAmount = dto.PlannedAmount,
            Note          = dto.Note
        };

        var created = await _budgetRepo.CreateAsync(budget);
        return MapToDto(created);
    }

    public async Task<BudgetDto?> UpdateAsync(Guid id, UpdateBudgetDto dto)
    {
        var existing = await _budgetRepo.GetByIdAsync(id);
        if (existing is null) return null;

        if (dto.PlannedAmount.HasValue) existing.PlannedAmount = dto.PlannedAmount.Value;
        if (dto.Note is not null)       existing.Note          = dto.Note;
        existing.UpdatedAt = DateTime.UtcNow;

        var updated = await _budgetRepo.UpdateAsync(existing);
        return updated is null ? null : MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _budgetRepo.GetByIdAsync(id);
        return existing is null ? false : await _budgetRepo.DeleteAsync(id);
    }

    // ========================
    // Overview
    // ========================

    public async Task<BudgetOverviewDto> GetOverviewAsync(int year, int month)
    {
        // Lấy tất cả ngân sách tháng này
        var budgets = (await _budgetRepo.GetByMonthAsync(year, month)).ToList();

        // Lấy thực chi theo category tháng này
        var spending = (await _budgetRepo.GetSpendingByCategoryAsync(year, month))
            .ToDictionary(x => x.CategoryId, x => x.SpentAmount);

        // Lấy tất cả category chi tiêu
        var categories = (await _categoryRepo.GetByTypeAsync(TransactionType.Expense)).ToList();

        // Chỉ giữ category nào có budget HOẶC có chi tiêu
        var relevantCategories = categories
            .Where(c => budgets.Any(b => b.CategoryId == c.Id) || spending.ContainsKey(c.Id))
            .ToList();

        var statusList = relevantCategories.Select(c =>
        {
            var budget = budgets.FirstOrDefault(b => b.CategoryId == c.Id);
            var spent  = spending.GetValueOrDefault(c.Id, 0);

            return new BudgetStatusDto
            {
                CategoryId    = c.Id,
                CategoryName  = c.Name,
                CategoryIcon  = c.Icon,
                CategoryColor = c.Color,
                BudgetId      = budget?.Id,
                PlannedAmount = budget?.PlannedAmount ?? 0,
                SpentAmount   = spent
            };
        })
        .OrderByDescending(s => s.SpentAmount)
        .ToList();

        return new BudgetOverviewDto
        {
            Year           = year,
            Month          = month,
            TotalPlanned   = statusList.Where(s => s.HasBudget).Sum(s => s.PlannedAmount),
            TotalSpent     = statusList.Sum(s => s.SpentAmount),
            OverBudgetCount = statusList.Count(s => s.IsOverBudget),
            NearLimitCount  = statusList.Count(s => s.IsNearLimit),
            OnTrackCount    = statusList.Count(s => s.HasBudget && !s.IsOverBudget && !s.IsNearLimit),
            NoBudgetCount   = statusList.Count(s => s.IsNoBudget),
            Categories     = statusList
        };
    }

    public async Task<IEnumerable<MonthlyBudgetSummaryDto>> GetYearlyOverviewAsync(int year)
    {
        var allBudgets  = (await _budgetRepo.GetByYearAsync(year)).ToList();
        var result      = new List<MonthlyBudgetSummaryDto>();

        for (int month = 1; month <= 12; month++)
        {
            var budgetsThisMonth = allBudgets.Where(b => b.Month == month).ToList();
            var spending         = (await _budgetRepo.GetSpendingByCategoryAsync(year, month))
                .ToDictionary(x => x.CategoryId, x => x.SpentAmount);

            var totalPlanned = budgetsThisMonth.Sum(b => b.PlannedAmount);
            var totalSpent   = spending.Values.Sum();

            // Số category vượt ngân sách
            var overCount = budgetsThisMonth
                .Count(b => spending.GetValueOrDefault(b.CategoryId, 0) > b.PlannedAmount);

            result.Add(new MonthlyBudgetSummaryDto
            {
                Year            = year,
                Month           = month,
                TotalPlanned    = totalPlanned,
                TotalSpent      = totalSpent,
                BudgetCount     = budgetsThisMonth.Count,
                OverBudgetCount = overCount
            });
        }

        return result;
    }

    // ========================
    // Bulk operations
    // ========================

    public async Task<IEnumerable<BudgetDto>> BulkUpsertAsync(BulkUpsertBudgetDto dto)
    {
        var budgetsToUpsert = new List<Budget>();

        foreach (var item in dto.Items)
        {
            var existing = await _budgetRepo.GetByCategoryAndMonthAsync(item.CategoryId, dto.Year, dto.Month);
            if (existing is not null)
            {
                // Update
                existing.PlannedAmount = item.PlannedAmount;
                existing.Note          = item.Note;
                existing.UpdatedAt     = DateTime.UtcNow;
                budgetsToUpsert.Add(existing);
            }
            else
            {
                // Create
                budgetsToUpsert.Add(new Budget
                {
                    CategoryId    = item.CategoryId,
                    Year          = dto.Year,
                    Month         = dto.Month,
                    PlannedAmount = item.PlannedAmount,
                    Note          = item.Note
                });
            }
        }

        var results = await _budgetRepo.BulkUpsertAsync(budgetsToUpsert);
        return results.Select(MapToDto);
    }

    public async Task<CopyBudgetResultDto> CopyFromMonthAsync(CopyBudgetDto dto)
    {
        if (dto.FromYear == dto.ToYear && dto.FromMonth == dto.ToMonth)
            throw new InvalidOperationException("Tháng nguồn và tháng đích không được trùng nhau.");

        var sourceBudgets = (await _budgetRepo.GetByMonthAsync(dto.FromYear, dto.FromMonth)).ToList();
        if (!sourceBudgets.Any())
            throw new InvalidOperationException(
                $"Tháng {dto.FromMonth}/{dto.FromYear} không có ngân sách nào để sao chép.");

        var result = new CopyBudgetResultDto();

        foreach (var source in sourceBudgets)
        {
            var exists = await _budgetRepo.ExistsAsync(source.CategoryId, dto.ToYear, dto.ToMonth);

            if (exists && !dto.Overwrite)
            {
                result.Skipped++;
                continue;
            }

            var target = await _budgetRepo.GetByCategoryAndMonthAsync(source.CategoryId, dto.ToYear, dto.ToMonth);
            if (target is not null && dto.Overwrite)
            {
                target.PlannedAmount = source.PlannedAmount;
                target.Note          = source.Note;
                target.UpdatedAt     = DateTime.UtcNow;
                await _budgetRepo.UpdateAsync(target);
                result.Overwritten++;
            }
            else
            {
                await _budgetRepo.CreateAsync(new Budget
                {
                    CategoryId    = source.CategoryId,
                    Year          = dto.ToYear,
                    Month         = dto.ToMonth,
                    PlannedAmount = source.PlannedAmount,
                    Note          = source.Note
                });
                result.Created++;
            }
        }

        return result;
    }

    // ========================
    // Mapping
    // ========================

    private static BudgetDto MapToDto(Budget b) => new()
    {
        Id            = b.Id,
        CategoryId    = b.CategoryId,
        CategoryName  = b.Category?.Name  ?? string.Empty,
        CategoryIcon  = b.Category?.Icon,
        CategoryColor = b.Category?.Color,
        Year          = b.Year,
        Month         = b.Month,
        PlannedAmount = b.PlannedAmount,
        Note          = b.Note,
        CreatedAt     = b.CreatedAt
    };
}