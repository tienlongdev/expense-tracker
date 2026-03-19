using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Domain.Interfaces;

public interface ISavingsRepository
{
    // CRUD
    Task<IEnumerable<SavingsAccount>> GetAllAsync();
    Task<SavingsAccount?> GetByIdAsync(Guid id);
    Task<SavingsAccount> CreateAsync(SavingsAccount account);
    Task<SavingsAccount?> UpdateAsync(SavingsAccount account);
    Task<bool> DeleteAsync(Guid id);

    // Filter
    Task<IEnumerable<SavingsAccount>> GetByTypeAsync(SavingsType type);
    Task<IEnumerable<SavingsAccount>> GetByStatusAsync(SavingsStatus status);
    Task<IEnumerable<SavingsAccount>> GetMaturingAsync(int withinDays);

    // History
    Task<SavingsHistory> AddHistoryAsync(SavingsHistory history);
    Task<IEnumerable<SavingsHistory>> GetHistoryAsync(Guid accountId);

    // Summary aggregates
    Task<decimal> GetTotalDepositedAsync();
    Task<decimal> GetTotalCurrentValueAsync();
    Task<IEnumerable<(SavingsType Type, decimal Deposited, decimal CurrentValue)>> GetByTypeSummaryAsync();
}