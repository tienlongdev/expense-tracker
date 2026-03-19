using ExpenseTracker.Application.DTOs;
using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;

namespace ExpenseTracker.Application.Services;

public class DebtService : IDebtService
{
    private readonly IDebtRepository _repository;

    public DebtService(IDebtRepository repository)
    {
        _repository = repository;
    }

    // ========================
    // CRUD
    // ========================

    public async Task<IEnumerable<DebtDto>> GetAllAsync()
    {
        var items = await _repository.GetAllAsync();
        return items.Select(MapToDto);
    }

    public async Task<DebtDto?> GetByIdAsync(Guid id)
    {
        var item = await _repository.GetByIdAsync(id);
        return item is null ? null : MapToDto(item);
    }

    public async Task<DebtDto> CreateAsync(CreateDebtDto dto)
    {
        var entity = new Debt
        {
            Title           = dto.Title,
            PersonName      = dto.PersonName,
            OriginalAmount  = dto.OriginalAmount,
            RemainingAmount = dto.OriginalAmount, // ban đầu bằng gốc
            Type            = dto.Type,
            Status          = DebtStatus.Unpaid,
            DueDate         = dto.DueDate,
            Note            = dto.Note
        };

        var created = await _repository.CreateAsync(entity);
        return MapToDto(created);
    }

    public async Task<DebtDto?> UpdateAsync(Guid id, UpdateDebtDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing is null) return null;

        if (dto.Title      is not null) existing.Title      = dto.Title;
        if (dto.PersonName is not null) existing.PersonName = dto.PersonName;
        if (dto.DueDate.HasValue)       existing.DueDate    = dto.DueDate;
        if (dto.Note       is not null) existing.Note       = dto.Note;
        existing.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(existing);
        return updated is null ? null : MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing is null) return false;

        if (existing.Status != DebtStatus.Unpaid)
            throw new InvalidOperationException("Chỉ có thể xoá khoản nợ chưa có thanh toán.");

        return await _repository.DeleteAsync(id);
    }

    // ========================
    // Filter
    // ========================

    public async Task<IEnumerable<DebtDto>> GetByTypeAsync(DebtType type)
    {
        var items = await _repository.GetByTypeAsync(type);
        return items.Select(MapToDto);
    }

    public async Task<IEnumerable<DebtDto>> GetByStatusAsync(DebtStatus status)
    {
        var items = await _repository.GetByStatusAsync(status);
        return items.Select(MapToDto);
    }

    public async Task<IEnumerable<DebtDto>> GetOverdueAsync()
    {
        var items = await _repository.GetOverdueAsync();
        return items.Select(MapToDto);
    }

    // ========================
    // Summary
    // ========================

    public async Task<DebtSummaryDto> GetSummaryAsync()
    {
        var overdueList = await _repository.GetOverdueAsync();

        return new DebtSummaryDto
        {
            TotalBorrowed          = await _repository.GetTotalByTypeAsync(DebtType.Borrowed),
            TotalBorrowedRemaining = await _repository.GetTotalRemainingByTypeAsync(DebtType.Borrowed),
            TotalLent              = await _repository.GetTotalByTypeAsync(DebtType.Lent),
            TotalLentRemaining     = await _repository.GetTotalRemainingByTypeAsync(DebtType.Lent),
            OverdueCount           = overdueList.Count()
        };
    }

    // ========================
    // Payment
    // ========================

    public async Task<DebtPaymentDto> AddPaymentAsync(Guid debtId, CreateDebtPaymentDto dto)
    {
        var debt = await _repository.GetByIdAsync(debtId)
            ?? throw new KeyNotFoundException($"Không tìm thấy khoản nợ {debtId}");

        if (debt.Status == DebtStatus.Paid)
            throw new InvalidOperationException("Khoản nợ này đã được thanh toán đầy đủ.");

        if (dto.Amount > debt.RemainingAmount)
            throw new InvalidOperationException(
                $"Số tiền thanh toán ({dto.Amount:N0}đ) vượt quá số dư còn lại ({debt.RemainingAmount:N0}đ).");

        // Tạo payment record
        var payment = new DebtPayment
        {
            DebtId   = debtId,
            Amount   = dto.Amount,
            PaidDate = dto.PaidDate,
            Note     = dto.Note
        };

        var created = await _repository.AddPaymentAsync(payment);

        // Cập nhật RemainingAmount + Status trên Debt
        debt.RemainingAmount -= dto.Amount;
        debt.Status = debt.RemainingAmount <= 0
            ? DebtStatus.Paid
            : DebtStatus.PartiallyPaid;
        debt.RemainingAmount = Math.Max(0, debt.RemainingAmount);
        debt.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(debt);

        return MapPaymentToDto(created);
    }

    public async Task<IEnumerable<DebtPaymentDto>> GetPaymentsAsync(Guid debtId)
    {
        var payments = await _repository.GetPaymentsAsync(debtId);
        return payments.Select(MapPaymentToDto);
    }

    // ========================
    // Mapping
    // ========================

    private static DebtDto MapToDto(Debt d) => new()
    {
        Id              = d.Id,
        Title           = d.Title,
        PersonName      = d.PersonName,
        OriginalAmount  = d.OriginalAmount,
        RemainingAmount = d.RemainingAmount,
        Type            = d.Type,
        Status          = d.Status,
        DueDate         = d.DueDate,
        Note            = d.Note,
        CreatedAt       = d.CreatedAt
    };

    private static DebtPaymentDto MapPaymentToDto(DebtPayment p) => new()
    {
        Id        = p.Id,
        DebtId    = p.DebtId,
        Amount    = p.Amount,
        PaidDate  = p.PaidDate,
        Note      = p.Note,
        CreatedAt = p.CreatedAt
    };
}