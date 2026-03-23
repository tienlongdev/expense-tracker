using ExpenseTracker.Application.DTOs;

namespace ExpenseTracker.Application.Interfaces;

public interface ITransactionService
{
    // CRUD
    Task<PagedResultDto<TransactionDto>> GetPagedAsync(TransactionQueryDto query);
    Task<TransactionDto?> GetByIdAsync(Guid id);
    Task<TransactionDto> CreateAsync(CreateTransactionDto dto);
    Task<TransactionDto?> UpdateAsync(Guid id, UpdateTransactionDto dto);
    Task<bool> DeleteAsync(Guid id);

    // Filter
    Task<IEnumerable<TransactionDto>> GetByDateAsync(DateTime date);
    Task<IEnumerable<TransactionDto>> GetByMonthAsync(int year, int month);
    Task<IEnumerable<TransactionDto>> GetByYearAsync(int year);

    // Summary
    Task<SummaryDto> GetSummaryAsync();
    Task<SummaryDto> GetSummaryByMonthAsync(int year, int month);
    Task<SummaryDto> GetSummaryByYearAsync(int year);

    // Report
    Task<IEnumerable<MonthlyReportDto>> GetYearlyReportAsync(int year);
}