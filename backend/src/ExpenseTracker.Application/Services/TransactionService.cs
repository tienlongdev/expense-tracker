using ExpenseTracker.Application.DTOs;
using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;

namespace ExpenseTracker.Application.Services;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _repository;
    private readonly INotificationService   _notificationService;

    /// <summary>CategoryId "Lương" seed cố định. Dùng để detect salary transaction.</summary>
    private static readonly Guid SalaryCategoryId = new("10000000-0000-0000-0000-000000000001");

    public TransactionService(
        ITransactionRepository repository,
        INotificationService   notificationService)
    {
        _repository          = repository;
        _notificationService = notificationService;
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
        var transaction = new Transaction
        {
            Title      = dto.Title,
            Amount     = dto.Amount,
            Type       = dto.Type,
            CategoryId = dto.CategoryId,
            Date       = dto.Date,
            Note       = dto.Note
        };

        var created = await _repository.CreateAsync(transaction);

        // ── Notification triggers ────────────────────────────────────────
        // Fire-and-forget: không block response, lỗi notification không ảnh hưởng transaction
        _ = Task.Run(async () =>
        {
            try
            {
                if (dto.Type == TransactionType.Expense)
                {
                    await _notificationService.TriggerBudgetAlertsAsync(
                        dto.CategoryId, dto.Date.Year, dto.Date.Month);
                }
                else if (dto.Type == TransactionType.Income
                         && dto.CategoryId == SalaryCategoryId)
                {
                    await _notificationService.TriggerSalaryReceivedAsync(dto.Amount, dto.Date);
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

        existing.Title = dto.Title;
        existing.Amount = dto.Amount;
        existing.Type = dto.Type;
        existing.CategoryId = dto.CategoryId;
        existing.Date = dto.Date;
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
}