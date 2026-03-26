using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;
using ExpenseTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Infrastructure.Repositories;

public class DebtRepository : IDebtRepository
{
    private readonly AppDbContext _context;

    public DebtRepository(AppDbContext context)
    {
        _context = context;
    }

    private IQueryable<Debt> QueryWithPayments()
        => _context.Debts.Include(d => d.Payments);

    // ========================
    // CRUD
    // ========================

    public async Task<IEnumerable<Debt>> GetAllAsync()
        => await QueryWithPayments()
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

    public async Task<Debt?> GetByIdAsync(Guid id)
        => await QueryWithPayments()
            .FirstOrDefaultAsync(d => d.Id == id);

    public async Task<Debt> CreateAsync(Debt debt)
    {
        debt.Id        = Guid.NewGuid();
        debt.CreatedAt = DateTime.UtcNow;
        _context.Debts.Add(debt);
        await _context.SaveChangesAsync();
        return debt;
    }

    public async Task<Debt?> UpdateAsync(Debt debt)
    {
        var existing = await _context.Debts.FirstOrDefaultAsync(d => d.Id == debt.Id);
        if (existing is null) return null;

        existing.Title           = debt.Title;
        existing.PersonName      = debt.PersonName;
        existing.RemainingAmount = debt.RemainingAmount;
        existing.Status          = debt.Status;
        existing.DueDate         = debt.DueDate;
        existing.Note            = debt.Note;
        existing.UpdatedAt       = debt.UpdatedAt ?? DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _context.Debts.FirstOrDefaultAsync(d => d.Id == id);
        if (entity is null) return false;

        _context.Debts.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    // ========================
    // Filter
    // ========================

    public async Task<IEnumerable<Debt>> GetByTypeAsync(DebtType type)
        => await QueryWithPayments()
            .Where(d => d.Type == type)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Debt>> GetByStatusAsync(DebtStatus status)
        => await QueryWithPayments()
            .Where(d => d.Status == status)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Debt>> GetOverdueAsync()
        => await QueryWithPayments()
            .Where(d => d.DueDate.HasValue
                     && d.DueDate.Value < DateTime.UtcNow
                     && d.Status != DebtStatus.Paid)
            .OrderBy(d => d.DueDate)
            .ToListAsync();

    // ========================
    // Payment
    // ========================

    public async Task<DebtPayment> AddPaymentAsync(DebtPayment payment)
    {
        payment.Id        = Guid.NewGuid();
        payment.CreatedAt = DateTime.UtcNow;
        _context.DebtPayments.Add(payment);
        await _context.SaveChangesAsync();
        return payment;
    }

    public async Task<IEnumerable<DebtPayment>> GetPaymentsAsync(Guid debtId)
        => await _context.DebtPayments
            .Where(p => p.DebtId == debtId)
            .OrderByDescending(p => p.PaidDate)
            .ToListAsync();

    // ========================
    // Summary
    // ========================

    public async Task<decimal> GetTotalByTypeAsync(DebtType type)
        => await _context.Debts
            .Where(d => d.Type == type)
            .SumAsync(d => (decimal?)d.OriginalAmount) ?? 0;

    public async Task<decimal> GetTotalRemainingByTypeAsync(DebtType type)
        => await _context.Debts
            .Where(d => d.Type == type && d.Status != DebtStatus.Paid)
            .SumAsync(d => (decimal?)d.RemainingAmount) ?? 0;
}
