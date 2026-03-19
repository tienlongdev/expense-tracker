using ExpenseTracker.Application.DTOs;
using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Application.Interfaces;

public interface IDebtService
{
    // CRUD
    Task<IEnumerable<DebtDto>> GetAllAsync();
    Task<DebtDto?> GetByIdAsync(Guid id);
    Task<DebtDto> CreateAsync(CreateDebtDto dto);
    Task<DebtDto?> UpdateAsync(Guid id, UpdateDebtDto dto);
    Task<bool> DeleteAsync(Guid id);

    // Filter
    Task<IEnumerable<DebtDto>> GetByTypeAsync(DebtType type);
    Task<IEnumerable<DebtDto>> GetByStatusAsync(DebtStatus status);
    Task<IEnumerable<DebtDto>> GetOverdueAsync();

    // Summary
    Task<DebtSummaryDto> GetSummaryAsync();

    // Payment
    Task<DebtPaymentDto> AddPaymentAsync(Guid debtId, CreateDebtPaymentDto dto);
    Task<IEnumerable<DebtPaymentDto>> GetPaymentsAsync(Guid debtId);
}