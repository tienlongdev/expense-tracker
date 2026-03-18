using ExpenseTracker.Application.DTOs;
using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;

namespace ExpenseTracker.Application.Services;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _repository;

    public TransactionService(ITransactionRepository repository)
    {
        _repository = repository;
    }

    // ========================
    // CRUD
    // ========================

    public async Task<IEnumerable<TransactionDto>> GetAllAsync()
    {
        var transactions = await _repository.GetAllAsync();
        return transactions.Select(MapToDto);
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
            Category = dto.Category,
            Date = dto.Date,
            Note = dto.Note
        };

        var created = await _repository.CreateAsync(transaction);
        return MapToDto(created);
    }

    public async Task<TransactionDto?> UpdateAsync(Guid id, UpdateTransactionDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing is null) return null;

        existing.Title = dto.Title;
        existing.Amount = dto.Amount;
        existing.Type = dto.Type;
        existing.Category = dto.Category;
        existing.Date = dto.Date;
        existing.Note = dto.Note;

        var updated = await _repository.UpdateAsync(existing);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        return await _repository.DeleteAsync(id);
    }

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

        return new SummaryDto
        {
            TotalIncome = income,
            TotalExpense = expense
        };
    }

    public async Task<SummaryDto> GetSummaryByMonthAsync(int year, int month)
    {
        var income = await _repository.GetTotalByTypeAndMonthAsync(TransactionType.Income, year, month);
        var expense = await _repository.GetTotalByTypeAndMonthAsync(TransactionType.Expense, year, month);

        return new SummaryDto
        {
            TotalIncome = income,
            TotalExpense = expense
        };
    }

    public async Task<SummaryDto> GetSummaryByYearAsync(int year)
    {
        var income = await _repository.GetTotalByTypeAndYearAsync(TransactionType.Income, year);
        var expense = await _repository.GetTotalByTypeAndYearAsync(TransactionType.Expense, year);

        return new SummaryDto
        {
            TotalIncome = income,
            TotalExpense = expense
        };
    }

    // ========================
    // Yearly Report
    // ========================

    public async Task<IEnumerable<MonthlyReportDto>> GetYearlyReportAsync(int year)
    {
        var report = new List<MonthlyReportDto>();

        for (int month = 1; month <= 12; month++)
        {
            var income = await _repository.GetTotalByTypeAndMonthAsync(TransactionType.Income, year, month);
            var expense = await _repository.GetTotalByTypeAndMonthAsync(TransactionType.Expense, year, month);

            report.Add(new MonthlyReportDto
            {
                Month = month,
                TotalIncome = income,
                TotalExpense = expense
            });
        }

        return report;
    }

    // ========================
    // Mapper (private)
    // ========================

    private static TransactionDto MapToDto(Transaction t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Amount = t.Amount,
        Type = t.Type,
        Category = t.Category,
        Date = t.Date,
        Note = t.Note,
        CreatedAt = t.CreatedAt
    };
}