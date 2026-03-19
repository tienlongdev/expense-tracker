using ExpenseTracker.Application.DTOs;
using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;

namespace ExpenseTracker.Application.Services;

public class SavingsService : ISavingsService
{
    private readonly ISavingsRepository _repository;

    public SavingsService(ISavingsRepository repository)
    {
        _repository = repository;
    }

    // ========================
    // CRUD
    // ========================

    public async Task<IEnumerable<SavingsAccountDto>> GetAllAsync()
    {
        var items = await _repository.GetAllAsync();
        return items.Select(MapToDto);
    }

    public async Task<SavingsAccountDto?> GetByIdAsync(Guid id)
    {
        var item = await _repository.GetByIdAsync(id);
        return item is null ? null : MapToDto(item);
    }

    public async Task<SavingsAccountDto> CreateAsync(CreateSavingsAccountDto dto)
    {
        var entity = new SavingsAccount
        {
            Name           = dto.Name,
            Type           = dto.Type,
            InitialAmount  = dto.InitialAmount,
            TotalDeposited = dto.InitialAmount,  // ban đầu bằng InitialAmount
            CurrentValue   = dto.InitialAmount,  // chưa có lời/lỗ
            InterestRate   = dto.InterestRate,
            StartDate      = dto.StartDate,
            MaturityDate   = dto.MaturityDate,
            Status         = SavingsStatus.Active,
            Note           = dto.Note
        };

        var created = await _repository.CreateAsync(entity);

        // Ghi history: nạp vốn ban đầu
        await _repository.AddHistoryAsync(new SavingsHistory
        {
            SavingsAccountId = created.Id,
            TransactionType  = SavingsTransactionType.Deposit,
            Amount           = dto.InitialAmount,
            PreviousValue    = 0,
            NewValue         = dto.InitialAmount,
            Note             = "Nạp vốn ban đầu",
            Date             = dto.StartDate
        });

        return MapToDto(created);
    }

    public async Task<SavingsAccountDto?> UpdateAsync(Guid id, UpdateSavingsAccountDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing is null) return null;

        if (existing.Status == SavingsStatus.Closed)
            throw new InvalidOperationException("Không thể cập nhật tài khoản đã đóng.");

        if (dto.Name         is not null) existing.Name         = dto.Name;
        if (dto.InterestRate.HasValue)    existing.InterestRate = dto.InterestRate;
        if (dto.MaturityDate.HasValue)    existing.MaturityDate = dto.MaturityDate;
        if (dto.Note         is not null) existing.Note         = dto.Note;
        existing.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(existing);
        return updated is null ? null : MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing is null) return false;

        if (existing.Status == SavingsStatus.Active && existing.CurrentValue > 0)
            throw new InvalidOperationException("Không thể xoá tài khoản đang hoạt động còn số dư. Hãy đóng tài khoản trước.");

        return await _repository.DeleteAsync(id);
    }

    // ========================
    // Filter
    // ========================

    public async Task<IEnumerable<SavingsAccountDto>> GetByTypeAsync(SavingsType type)
    {
        var items = await _repository.GetByTypeAsync(type);
        return items.Select(MapToDto);
    }

    public async Task<IEnumerable<SavingsAccountDto>> GetByStatusAsync(SavingsStatus status)
    {
        var items = await _repository.GetByStatusAsync(status);
        return items.Select(MapToDto);
    }

    public async Task<IEnumerable<SavingsAccountDto>> GetMaturingAsync(int withinDays = 30)
    {
        var items = await _repository.GetMaturingAsync(withinDays);
        return items.Select(MapToDto);
    }

    // ========================
    // Transactions
    // ========================

    public async Task<SavingsHistoryDto> DepositAsync(Guid id, SavingsDepositDto dto)
    {
        var account = await GetActiveAccountAsync(id);

        var previous = account.CurrentValue;
        account.CurrentValue   += dto.Amount;
        account.TotalDeposited += dto.Amount;
        account.UpdatedAt       = DateTime.UtcNow;
        await _repository.UpdateAsync(account);

        var history = await _repository.AddHistoryAsync(new SavingsHistory
        {
            SavingsAccountId = id,
            TransactionType  = SavingsTransactionType.Deposit,
            Amount           = dto.Amount,
            PreviousValue    = previous,
            NewValue         = account.CurrentValue,
            Note             = dto.Note,
            Date             = dto.Date
        });

        return MapHistoryToDto(history);
    }

    public async Task<SavingsHistoryDto> WithdrawAsync(Guid id, SavingsWithdrawDto dto)
    {
        var account = await GetActiveAccountAsync(id);

        if (dto.Amount > account.CurrentValue)
            throw new InvalidOperationException(
                $"Số tiền rút ({dto.Amount:N0}đ) vượt quá giá trị hiện tại ({account.CurrentValue:N0}đ).");

        var previous = account.CurrentValue;
        account.CurrentValue -= dto.Amount;
        account.UpdatedAt     = DateTime.UtcNow;
        await _repository.UpdateAsync(account);

        var history = await _repository.AddHistoryAsync(new SavingsHistory
        {
            SavingsAccountId = id,
            TransactionType  = SavingsTransactionType.Withdrawal,
            Amount           = dto.Amount,
            PreviousValue    = previous,
            NewValue         = account.CurrentValue,
            Note             = dto.Note,
            Date             = dto.Date
        });

        return MapHistoryToDto(history);
    }

    public async Task<SavingsHistoryDto> UpdateValueAsync(Guid id, UpdateSavingsValueDto dto)
    {
        var account = await GetActiveAccountAsync(id);

        var previous = account.CurrentValue;
        account.CurrentValue = dto.NewValue;
        account.UpdatedAt    = DateTime.UtcNow;
        await _repository.UpdateAsync(account);

        var profitLoss = dto.NewValue - previous;

        var history = await _repository.AddHistoryAsync(new SavingsHistory
        {
            SavingsAccountId = id,
            TransactionType  = SavingsTransactionType.ValueUpdate,
            Amount           = 0,
            PreviousValue    = previous,
            NewValue         = dto.NewValue,
            Note             = dto.Note ?? (profitLoss >= 0
                ? $"Tăng {profitLoss:N0}đ (+{(previous == 0 ? 0 : Math.Round(profitLoss / previous * 100, 1))}%)"
                : $"Giảm {Math.Abs(profitLoss):N0}đ ({(previous == 0 ? 0 : Math.Round(profitLoss / previous * 100, 1))}%)"),
            Date             = dto.Date
        });

        return MapHistoryToDto(history);
    }

    public async Task<SavingsHistoryDto> AddInterestAsync(Guid id, SavingsInterestDto dto)
    {
        var account = await GetActiveAccountAsync(id);

        var previous = account.CurrentValue;
        account.CurrentValue += dto.Amount;
        account.UpdatedAt     = DateTime.UtcNow;
        await _repository.UpdateAsync(account);

        var history = await _repository.AddHistoryAsync(new SavingsHistory
        {
            SavingsAccountId = id,
            TransactionType  = SavingsTransactionType.InterestReceived,
            Amount           = dto.Amount,
            PreviousValue    = previous,
            NewValue         = account.CurrentValue,
            Note             = dto.Note ?? $"Nhận lãi suất {dto.Amount:N0}đ",
            Date             = dto.Date
        });

        return MapHistoryToDto(history);
    }

    // ========================
    // History
    // ========================

    public async Task<IEnumerable<SavingsHistoryDto>> GetHistoryAsync(Guid id)
    {
        _ = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Không tìm thấy tài khoản {id}");

        var history = await _repository.GetHistoryAsync(id);
        return history.Select(MapHistoryToDto);
    }

    // ========================
    // Close account
    // ========================

    public async Task<SavingsAccountDto?> CloseAsync(Guid id, string? note = null)
    {
        var account = await _repository.GetByIdAsync(id);
        if (account is null) return null;

        if (account.Status == SavingsStatus.Closed)
            throw new InvalidOperationException("Tài khoản đã được đóng trước đó.");

        account.Status    = SavingsStatus.Closed;
        account.UpdatedAt = DateTime.UtcNow;
        if (note is not null) account.Note = note;

        var updated = await _repository.UpdateAsync(account);
        return updated is null ? null : MapToDto(updated);
    }

    // ========================
    // Summary
    // ========================

    public async Task<SavingsSummaryDto> GetSummaryAsync()
    {
        var all     = (await _repository.GetAllAsync()).ToList();
        var byTypes = await _repository.GetByTypeSummaryAsync();

        return new SavingsSummaryDto
        {
            TotalDeposited    = await _repository.GetTotalDepositedAsync(),
            TotalCurrentValue = await _repository.GetTotalCurrentValueAsync(),
            ActiveCount       = all.Count(a => a.Status == SavingsStatus.Active),
            MaturedCount      = all.Count(a => a.Status == SavingsStatus.Matured),
            ClosedCount       = all.Count(a => a.Status == SavingsStatus.Closed),
            ByType            = byTypes.Select(b => new SavingsByTypeDto
            {
                Type           = b.Type,
                TypeName       = GetTypeName(b.Type),
                Count          = all.Count(a => a.Type == b.Type),
                TotalDeposited = b.Deposited,
                CurrentValue   = b.CurrentValue
            }).ToList()
        };
    }

    // ========================
    // Helpers
    // ========================

    private async Task<SavingsAccount> GetActiveAccountAsync(Guid id)
    {
        var account = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Không tìm thấy tài khoản {id}");

        if (account.Status == SavingsStatus.Closed)
            throw new InvalidOperationException("Tài khoản đã đóng, không thể thực hiện giao dịch.");

        return account;
    }

    private static string GetTypeName(SavingsType type) => type switch
    {
        SavingsType.Savings    => "Tiết kiệm",
        SavingsType.Stock      => "Chứng khoán",
        SavingsType.Gold       => "Vàng",
        SavingsType.Crypto     => "Tiền điện tử",
        SavingsType.RealEstate => "Bất động sản",
        SavingsType.Fund       => "Quỹ đầu tư",
        _                      => "Khác"
    };

    private static SavingsAccountDto MapToDto(SavingsAccount a) => new()
    {
        Id             = a.Id,
        Name           = a.Name,
        Type           = a.Type,
        InitialAmount  = a.InitialAmount,
        TotalDeposited = a.TotalDeposited,
        CurrentValue   = a.CurrentValue,
        InterestRate   = a.InterestRate,
        StartDate      = a.StartDate,
        MaturityDate   = a.MaturityDate,
        Status         = a.Status,
        Note           = a.Note,
        CreatedAt      = a.CreatedAt
    };

    private static SavingsHistoryDto MapHistoryToDto(SavingsHistory h) => new()
    {
        Id               = h.Id,
        SavingsAccountId = h.SavingsAccountId,
        TransactionType  = h.TransactionType,
        Amount           = h.Amount,
        PreviousValue    = h.PreviousValue,
        NewValue         = h.NewValue,
        Note             = h.Note,
        Date             = h.Date,
        CreatedAt        = h.CreatedAt
    };
}