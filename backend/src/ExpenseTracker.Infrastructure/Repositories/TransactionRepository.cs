using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;
using ExpenseTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Infrastructure.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly AppDbContext _context;

    public TransactionRepository(AppDbContext context)
    {
        _context = context;
    }

    private IQueryable<Transaction> QueryWithCategory()
        => _context.Transactions.Include(t => t.Category);

    // ========================
    // CRUD
    // ========================

    public async Task<(IReadOnlyList<Transaction> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        DateTime? fromDate,
        DateTime? toDate,
        TransactionType? type,
        string? title)
    {
        var query = QueryWithCategory().AsNoTracking();

        if (fromDate.HasValue)
            query = query.Where(t => t.Date.Date >= fromDate.Value.Date);

        if (toDate.HasValue)
            query = query.Where(t => t.Date.Date <= toDate.Value.Date);

        if (type.HasValue)
            query = query.Where(t => t.Type == type.Value);

        if (!string.IsNullOrWhiteSpace(title))
        {
            var normalizedTitle = title.Trim();
            query = query.Where(t => t.Title.Contains(normalizedTitle));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<Transaction?> GetByIdAsync(Guid id)
        => await QueryWithCategory()
            .FirstOrDefaultAsync(t => t.Id == id);

    public async Task<Transaction> CreateAsync(Transaction transaction)
    {
        transaction.Id = Guid.NewGuid();
        transaction.CreatedAt = DateTime.UtcNow;
        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        // Reload với navigation
        await _context.Entry(transaction).Reference(t => t.Category).LoadAsync();
        return transaction;
    }

    public async Task<Transaction> UpdateAsync(Transaction transaction)
    {
        transaction.UpdatedAt = DateTime.UtcNow;
        _context.Transactions.Update(transaction);
        await _context.SaveChangesAsync();

        await _context.Entry(transaction).Reference(t => t.Category).LoadAsync();
        return transaction;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.Id == id);
        if (transaction is null) return false;

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();
        return true;
    }

    // ========================
    // Filter
    // ========================

    public async Task<IEnumerable<Transaction>> GetByDateAsync(DateTime date)
        => await QueryWithCategory()
            .Where(t => t.Date.Date == date.Date)
            .OrderByDescending(t => t.Date)
            .ToListAsync();

    public async Task<IEnumerable<Transaction>> GetByMonthAsync(int year, int month)
        => await QueryWithCategory()
            .Where(t => t.Date.Year == year && t.Date.Month == month)
            .OrderByDescending(t => t.Date)
            .ToListAsync();

    public async Task<IEnumerable<Transaction>> GetByYearAsync(int year)
        => await QueryWithCategory()
            .Where(t => t.Date.Year == year)
            .OrderByDescending(t => t.Date)
            .ToListAsync();

    // ========================
    // Summary
    // ========================

    public async Task<decimal> GetTotalByTypeAsync(TransactionType type)
        => await _context.Transactions
            .Where(t => t.Type == type)
            .SumAsync(t => t.Amount);

    public async Task<decimal> GetTotalByTypeAndMonthAsync(TransactionType type, int year, int month)
        => await _context.Transactions
            .Where(t => t.Type == type && t.Date.Year == year && t.Date.Month == month)
            .SumAsync(t => t.Amount);

    public async Task<decimal> GetTotalByTypeAndYearAsync(TransactionType type, int year)
        => await _context.Transactions
            .Where(t => t.Type == type && t.Date.Year == year)
            .SumAsync(t => t.Amount);
}