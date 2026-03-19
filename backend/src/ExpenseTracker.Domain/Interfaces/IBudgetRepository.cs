using ExpenseTracker.Domain.Entities;

namespace ExpenseTracker.Domain.Interfaces;

public interface IBudgetRepository
{
    // Query
    Task<IEnumerable<Budget>> GetByMonthAsync(int year, int month);
    Task<IEnumerable<Budget>> GetByYearAsync(int year);
    Task<Budget?> GetByIdAsync(Guid id);
    Task<Budget?> GetByCategoryAndMonthAsync(Guid categoryId, int year, int month);
    Task<bool> ExistsAsync(Guid categoryId, int year, int month);

    // CRUD
    Task<Budget>  CreateAsync(Budget budget);
    Task<Budget?> UpdateAsync(Budget budget);
    Task<bool>    DeleteAsync(Guid id);

    // Bulk
    Task<IEnumerable<Budget>> BulkUpsertAsync(IEnumerable<Budget> budgets);

    // Spending aggregates — truy vấn từ bảng Transactions
    Task<IEnumerable<(Guid CategoryId, decimal SpentAmount)>> GetSpendingByCategoryAsync(int year, int month);
    Task<decimal> GetSpentAmountAsync(Guid categoryId, int year, int month);
}