using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Domain.Interfaces;

public interface IDebtRepository
{
    // CRUD
    Task<IEnumerable<Debt>> GetAllAsync();
    Task<Debt?> GetByIdAsync(Guid id);
    Task<Debt> CreateAsync(Debt debt);
    Task<Debt?> UpdateAsync(Debt debt);
    Task<bool> DeleteAsync(Guid id);

    // Filter
    Task<IEnumerable<Debt>> GetByTypeAsync(DebtType type);
    Task<IEnumerable<Debt>> GetByStatusAsync(DebtStatus status);
    Task<IEnumerable<Debt>> GetOverdueAsync();

    // Payment
    Task<DebtPayment> AddPaymentAsync(DebtPayment payment);
    Task<IEnumerable<DebtPayment>> GetPaymentsAsync(Guid debtId);

    // Summary
    Task<decimal> GetTotalByTypeAsync(DebtType type);
    Task<decimal> GetTotalRemainingByTypeAsync(DebtType type);
}