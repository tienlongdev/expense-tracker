using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Domain.Interfaces;

public interface ITransactionRepository
{
    // CRUD
    Task<IEnumerable<Transaction>> GetAllAsync();
    Task<Transaction?> GetByIdAsync(Guid id);
    Task<Transaction> CreateAsync(Transaction transaction);
    Task<Transaction> UpdateAsync(Transaction transaction);
    Task<bool> DeleteAsync(Guid id);

    // Filter
    Task<IEnumerable<Transaction>> GetByDateAsync(DateTime date);
    Task<IEnumerable<Transaction>> GetByMonthAsync(int year, int month);
    Task<IEnumerable<Transaction>> GetByYearAsync(int year);

    // Summary
    Task<decimal> GetTotalByTypeAsync(TransactionType type);
    Task<decimal> GetTotalByTypeAndMonthAsync(TransactionType type, int year, int month);
    Task<decimal> GetTotalByTypeAndYearAsync(TransactionType type, int year);
}