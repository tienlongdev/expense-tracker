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
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICategoryRepository _categoryRepository;

    public TransactionService(
        ITransactionRepository repository,
        IServiceScopeFactory scopeFactory,
        ICurrentUserService currentUserService,
        ICategoryRepository categoryRepository)
    {
        _repository = repository;
        _scopeFactory = scopeFactory;
        _currentUserService = currentUserService;
        _categoryRepository = categoryRepository;
    }

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
            query.Title);

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
            Title = dto.Title,
            Amount = dto.Amount,
            Type = dto.Type,
            CategoryId = dto.CategoryId,
            Date = dto.Date,
            Note = dto.Note
        };

        var created = await _repository.CreateAsync(transaction);
        var currentUserId = _currentUserService.UserId;

        var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
        var isSalaryCategory = dto.Type == TransactionType.Income
            && category is not null
            && string.Equals(category.Name.Trim(), "Lương", StringComparison.OrdinalIgnoreCase);

        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var scopedCurrentUser = scope.ServiceProvider.GetRequiredService<ICurrentUserService>();
                scopedCurrentUser.SetOverrideUserId(currentUserId);

                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                if (dto.Type == TransactionType.Expense)
                {
                    await notificationService.TriggerBudgetAlertsAsync(dto.CategoryId, dto.Date.Year, dto.Date.Month);
                }
                else if (isSalaryCategory)
                {
                    await notificationService.TriggerSalaryReceivedAsync(dto.Amount, dto.Date);
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[NotificationTrigger] {ex.Message}");
            }
        });

        return MapToDto(created);
    }

    public async Task<TransactionDto?> UpdateAsync(Guid id, UpdateTransactionDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing is null)
        {
            return null;
        }

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

    public async Task<IEnumerable<MonthlyReportDto>> GetYearlyReportAsync(int year)
    {
        var report = new List<MonthlyReportDto>();
        for (var month = 1; month <= 12; month++)
        {
            var income = await _repository.GetTotalByTypeAndMonthAsync(TransactionType.Income, year, month);
            var expense = await _repository.GetTotalByTypeAndMonthAsync(TransactionType.Expense, year, month);

            report.Add(new MonthlyReportDto
            {
                Month = month,
                Year = year,
                TotalIncome = income,
                TotalExpense = expense
            });
        }

        return report;
    }

    private static TransactionDto MapToDto(Transaction transaction) => new()
    {
        Id = transaction.Id,
        Title = transaction.Title,
        Amount = transaction.Amount,
        Type = transaction.Type,
        CategoryId = transaction.CategoryId,
        CategoryName = transaction.Category?.Name ?? string.Empty,
        CategoryIcon = transaction.Category?.Icon,
        CategoryColor = transaction.Category?.Color,
        Date = transaction.Date,
        Note = transaction.Note,
        CreatedAt = transaction.CreatedAt
    };
}
