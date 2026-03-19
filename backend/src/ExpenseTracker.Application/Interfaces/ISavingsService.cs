using ExpenseTracker.Application.DTOs;
using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Application.Interfaces;

public interface ISavingsService
{
    // CRUD
    Task<IEnumerable<SavingsAccountDto>> GetAllAsync();
    Task<SavingsAccountDto?> GetByIdAsync(Guid id);
    Task<SavingsAccountDto> CreateAsync(CreateSavingsAccountDto dto);
    Task<SavingsAccountDto?> UpdateAsync(Guid id, UpdateSavingsAccountDto dto);
    Task<bool> DeleteAsync(Guid id);

    // Filter
    Task<IEnumerable<SavingsAccountDto>> GetByTypeAsync(SavingsType type);
    Task<IEnumerable<SavingsAccountDto>> GetByStatusAsync(SavingsStatus status);
    Task<IEnumerable<SavingsAccountDto>> GetMaturingAsync(int withinDays = 30);

    // Transactions
    Task<SavingsHistoryDto> DepositAsync(Guid id, SavingsDepositDto dto);
    Task<SavingsHistoryDto> WithdrawAsync(Guid id, SavingsWithdrawDto dto);
    Task<SavingsHistoryDto> UpdateValueAsync(Guid id, UpdateSavingsValueDto dto);
    Task<SavingsHistoryDto> AddInterestAsync(Guid id, SavingsInterestDto dto);

    // History
    Task<IEnumerable<SavingsHistoryDto>> GetHistoryAsync(Guid id);

    // Close account
    Task<SavingsAccountDto?> CloseAsync(Guid id, string? note = null);

    // Summary
    Task<SavingsSummaryDto> GetSummaryAsync();
}