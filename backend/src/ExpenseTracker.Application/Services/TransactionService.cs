using ExpenseTracker.Application.DTOs;
using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace ExpenseTracker.Application.Services;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _repository;
    private readonly ICategoryRepository    _categoryRepository;
    private readonly IServiceScopeFactory   _scopeFactory;

    /// <summary>CategoryId "Lương" seed cố định. Dùng để detect salary transaction.</summary>
    private static readonly Guid SalaryCategoryId = new("10000000-0000-0000-0000-000000000001");

    public TransactionService(
        ITransactionRepository repository,
        ICategoryRepository    categoryRepository,
        IServiceScopeFactory   scopeFactory)
    {
        _repository         = repository;
        _categoryRepository = categoryRepository;
        _scopeFactory       = scopeFactory;
    }

    // ========================
    // CRUD
    // ========================

    public async Task<PagedResultDto<TransactionDto>> GetPagedAsync(TransactionQueryDto query)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize < 1 ? 20 : query.PageSize;

        var (items, totalCount) = await _repository.GetPagedAsync(
            page,
            pageSize,
            query.FromDate,
            query.ToDate,
            query.Type,
            query.Title
        );

        return new PagedResultDto<TransactionDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<TransactionDto?> GetByIdAsync(Guid id)
    {
        var transaction = await _repository.GetByIdAsync(id);
        return transaction is null ? null : MapToDto(transaction);
    }

    public async Task<TransactionDto> CreateAsync(CreateTransactionDto dto)
    {
        await ValidateCategoryAsync(dto.CategoryId, dto.Type);

        // Npgsql requires DateTimeKind.Utc for timestamptz columns.
        // iOS may send date-only strings parsed as Unspecified — normalise to UTC.
        var dateUtc = dto.Date.Kind == DateTimeKind.Utc
            ? dto.Date
            : DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc);

        var transaction = new Transaction
        {
            Title      = dto.Title,
            Amount     = dto.Amount,
            Type       = dto.Type,
            CategoryId = dto.CategoryId,
            Date       = dateUtc,
            Note       = dto.Note
        };

        var created = await _repository.CreateAsync(transaction);

        // ── Notification triggers ────────────────────────────────────────
        // Fire-and-forget: dùng IServiceScopeFactory để tạo scope mới cho background task
        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                if (dto.Type == TransactionType.Expense)
                {
                    await notificationService.TriggerBudgetAlertsAsync(
                        dto.CategoryId, dto.Date.Year, dto.Date.Month);
                }
                else if (dto.Type == TransactionType.Income
                         && dto.CategoryId == SalaryCategoryId)
                {
                    await notificationService.TriggerSalaryReceivedAsync(dto.Amount, dto.Date);
                }
            }
            catch (Exception ex)
            {
                // Không crash request chính khi trigger notification lỗi
                Console.Error.WriteLine($"[NotificationTrigger] {ex.Message}");
            }
        });

        return MapToDto(created);
    }

    public async Task<TransactionDto?> UpdateAsync(Guid id, UpdateTransactionDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing is null) return null;

        await ValidateCategoryAsync(dto.CategoryId, dto.Type);

        var dateUtc = dto.Date.Kind == DateTimeKind.Utc
            ? dto.Date
            : DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc);

        existing.Title = dto.Title;
        existing.Amount = dto.Amount;
        existing.Type = dto.Type;
        existing.CategoryId = dto.CategoryId;
        existing.Date = dateUtc;
        existing.Note = dto.Note;

        var updated = await _repository.UpdateAsync(existing);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
        => await _repository.DeleteAsync(id);

    // ========================
    // Filter
    // ========================

    public async Task<IEnumerable<TransactionDto>> GetByDateAsync(DateTime date)
    {
        var transactions = await _repository.GetByDateAsync(date);
        return transactions.Select(MapToDto);
    }

    public async Task<IEnumerable<TransactionDto>> GetByMonthAsync(int year, int month)
    {
        var transactions = await _repository.GetByMonthAsync(year, month);
        return transactions.Select(MapToDto);
    }

    public async Task<IEnumerable<TransactionDto>> GetByYearAsync(int year)
    {
        var transactions = await _repository.GetByYearAsync(year);
        return transactions.Select(MapToDto);
    }

    // ========================
    // Summary
    // ========================

    public async Task<SummaryDto> GetSummaryAsync()
    {
        var income = await _repository.GetTotalByTypeAsync(TransactionType.Income);
        var expense = await _repository.GetTotalByTypeAsync(TransactionType.Expense);
        return new SummaryDto { TotalIncome = income, TotalExpense = expense };
    }

    public async Task<SummaryDto> GetSummaryByMonthAsync(int year, int month)
    {
        var income = await _repository.GetTotalByTypeAndMonthAsync(TransactionType.Income, year, month);
        var expense = await _repository.GetTotalByTypeAndMonthAsync(TransactionType.Expense, year, month);
        return new SummaryDto { TotalIncome = income, TotalExpense = expense };
    }

    public async Task<SummaryDto> GetSummaryByYearAsync(int year)
    {
        var income = await _repository.GetTotalByTypeAndYearAsync(TransactionType.Income, year);
        var expense = await _repository.GetTotalByTypeAndYearAsync(TransactionType.Expense, year);
        return new SummaryDto { TotalIncome = income, TotalExpense = expense };
    }

    // ========================
    // Report
    // ========================

    public async Task<IEnumerable<MonthlyReportDto>> GetYearlyReportAsync(int year)
    {
        var report = new List<MonthlyReportDto>();
        for (int m = 1; m <= 12; m++)
        {
            var income = await _repository.GetTotalByTypeAndMonthAsync(TransactionType.Income, year, m);
            var expense = await _repository.GetTotalByTypeAndMonthAsync(TransactionType.Expense, year, m);
            report.Add(new MonthlyReportDto { Month = m, Year = year, TotalIncome = income, TotalExpense = expense });
        }
        return report;
    }

    // ========================
    // Mapping
    // ========================

    private static TransactionDto MapToDto(Transaction t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Amount = t.Amount,
        Type = t.Type,
        CategoryId = t.CategoryId,
        CategoryName = t.Category?.Name ?? string.Empty,
        CategoryIcon = t.Category?.Icon,
        CategoryColor = t.Category?.Color,
        Date = t.Date,
        Note = t.Note,
        CreatedAt = t.CreatedAt
    };

    private async Task ValidateCategoryAsync(Guid categoryId, TransactionType type)
    {
        var category = await _categoryRepository.GetByIdAsync(categoryId);
        if (category is null)
            throw new InvalidOperationException("Danh mục không tồn tại.");

        if (category.Type != type)
            throw new InvalidOperationException("Danh mục không khớp với loại giao dịch đã chọn.");
    }
}
