using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;
using ExpenseTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Infrastructure.Repositories;

public class SavingsRepository : ISavingsRepository
{
    private readonly AppDbContext _context;

    public SavingsRepository(AppDbContext context)
    {
        _context = context;
    }

    private IQueryable<SavingsAccount> QueryWithHistory()
        => _context.SavingsAccounts.Include(a => a.History);

    // ========================
    // CRUD
    // ========================

    public async Task<IEnumerable<SavingsAccount>> GetAllAsync()
        => await QueryWithHistory()
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

    public async Task<SavingsAccount?> GetByIdAsync(Guid id)
        => await QueryWithHistory()
            .FirstOrDefaultAsync(a => a.Id == id);

    public async Task<SavingsAccount> CreateAsync(SavingsAccount account)
    {
        account.Id        = Guid.NewGuid();
        account.CreatedAt = DateTime.UtcNow;
        _context.SavingsAccounts.Add(account);
        await _context.SaveChangesAsync();
        return account;
    }

    public async Task<SavingsAccount?> UpdateAsync(SavingsAccount account)
    {
        var existing = await _context.SavingsAccounts.FirstOrDefaultAsync(a => a.Id == account.Id);
        if (existing is null) return null;

        existing.Name           = account.Name;
        existing.CurrentValue   = account.CurrentValue;
        existing.TotalDeposited = account.TotalDeposited;
        existing.InterestRate   = account.InterestRate;
        existing.MaturityDate   = account.MaturityDate;
        existing.Status         = account.Status;
        existing.Note           = account.Note;
        existing.UpdatedAt      = account.UpdatedAt ?? DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _context.SavingsAccounts.FirstOrDefaultAsync(a => a.Id == id);
        if (entity is null) return false;

        _context.SavingsAccounts.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    // ========================
    // Filter
    // ========================

    public async Task<IEnumerable<SavingsAccount>> GetByTypeAsync(SavingsType type)
        => await QueryWithHistory()
            .Where(a => a.Type == type)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<SavingsAccount>> GetByStatusAsync(SavingsStatus status)
        => await QueryWithHistory()
            .Where(a => a.Status == status)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<SavingsAccount>> GetMaturingAsync(int withinDays)
    {
        var threshold = DateTime.UtcNow.AddDays(withinDays);
        return await QueryWithHistory()
            .Where(a => a.Status == SavingsStatus.Active
                     && a.MaturityDate.HasValue
                     && a.MaturityDate.Value <= threshold
                     && a.MaturityDate.Value >= DateTime.UtcNow)
            .OrderBy(a => a.MaturityDate)
            .ToListAsync();
    }

    // ========================
    // History
    // ========================

    public async Task<SavingsHistory> AddHistoryAsync(SavingsHistory history)
    {
        history.Id        = Guid.NewGuid();
        history.CreatedAt = DateTime.UtcNow;
        _context.SavingsHistories.Add(history);
        await _context.SaveChangesAsync();
        return history;
    }

    public async Task<IEnumerable<SavingsHistory>> GetHistoryAsync(Guid accountId)
        => await _context.SavingsHistories
            .Where(h => h.SavingsAccountId == accountId)
            .OrderByDescending(h => h.Date)
            .ToListAsync();

    // ========================
    // Summary
    // ========================

    public async Task<decimal> GetTotalDepositedAsync()
        => await _context.SavingsAccounts
            .Where(a => a.Status != SavingsStatus.Closed)
            .SumAsync(a => (decimal?)a.TotalDeposited) ?? 0;

    public async Task<decimal> GetTotalCurrentValueAsync()
        => await _context.SavingsAccounts
            .Where(a => a.Status != SavingsStatus.Closed)
            .SumAsync(a => (decimal?)a.CurrentValue) ?? 0;

    public async Task<IEnumerable<(SavingsType Type, decimal Deposited, decimal CurrentValue)>>
        GetByTypeSummaryAsync()
    {
        var grouped = await _context.SavingsAccounts
            .Where(a => a.Status != SavingsStatus.Closed)
            .GroupBy(a => a.Type)
            .Select(g => new
            {
                Type         = g.Key,
                Deposited    = g.Sum(a => a.TotalDeposited),
                CurrentValue = g.Sum(a => a.CurrentValue)
            })
            .ToListAsync();

        return grouped.Select(g => (g.Type, g.Deposited, g.CurrentValue));
    }
}
