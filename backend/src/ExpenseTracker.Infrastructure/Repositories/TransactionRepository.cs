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

    // ========================
    // CRUD
    // ========================

    public async Task<IEnumerable<Transaction>> GetAllAsync()
    {
        return await _context.Transactions
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    public async Task<Transaction?> GetByIdAsync(Guid id)
    {
        return await _context.Transactions
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<Transaction> CreateAsync(Transaction transaction)
    {
        transaction.Id = Guid.NewGuid();
        transaction.CreatedAt = DateTime.UtcNow;

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return transaction;
    }

    public async Task<Transaction> UpdateAsync(Transaction transaction)
    {
        transaction.UpdatedAt = DateTime.UtcNow;

        _context.Transactions.Update(transaction);
        await _context.SaveChangesAsync();

        return transaction;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transaction is null) return false;

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();

        return true;
    }

    // ========================
    // Filter
    // ========================

    public async Task<IEnumerable<Transaction>> GetByDateAsync(DateTime date)
    {
        return await _context.Transactions
            .Where(t => t.Date.Date == date.Date)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    public async Task<IEnumerable<Transaction>> GetByMonthAsync(int year, int month)
    {
        return await _context.Transactions
            .Where(t => t.Date.Year == year && t.Date.Month == month)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    public async Task<IEnumerable<Transaction>> GetByYearAsync(int year)
    {
        return await _context.Transactions
            .Where(t => t.Date.Year == year)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    // ========================
    // Summary
    // ========================

    public async Task<decimal> GetTotalByTypeAsync(TransactionType type)
    {
        return await _context.Transactions
            .Where(t => t.Type == type)
            .SumAsync(t => t.Amount);
    }

    public async Task<decimal> GetTotalByTypeAndMonthAsync(
        TransactionType type, int year, int month)
    {
        return await _context.Transactions
            .Where(t => t.Type == type
                     && t.Date.Year == year
                     && t.Date.Month == month)
            .SumAsync(t => t.Amount);
    }

    public async Task<decimal> GetTotalByTypeAndYearAsync(
        TransactionType type, int year)
    {
        return await _context.Transactions
            .Where(t => t.Type == type
                     && t.Date.Year == year)
            .SumAsync(t => t.Amount);
    }
}