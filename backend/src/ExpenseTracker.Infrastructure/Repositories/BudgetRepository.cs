using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;
using ExpenseTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Infrastructure.Repositories;

public class BudgetRepository : IBudgetRepository
{
    private readonly AppDbContext _context;

    public BudgetRepository(AppDbContext context)
    {
        _context = context;
    }

    private IQueryable<Budget> QueryWithCategory()
        => _context.Budgets.Include(b => b.Category);

    // ========================
    // Query
    // ========================

    public async Task<IEnumerable<Budget>> GetByMonthAsync(int year, int month)
        => await QueryWithCategory()
            .Where(b => b.Year == year && b.Month == month)
            .OrderBy(b => b.Category!.Name)
            .ToListAsync();

    public async Task<IEnumerable<Budget>> GetByYearAsync(int year)
        => await QueryWithCategory()
            .Where(b => b.Year == year)
            .OrderBy(b => b.Month)
            .ThenBy(b => b.Category!.Name)
            .ToListAsync();

    public async Task<Budget?> GetByIdAsync(Guid id)
        => await QueryWithCategory()
            .FirstOrDefaultAsync(b => b.Id == id);

    public async Task<Budget?> GetByCategoryAndMonthAsync(Guid categoryId, int year, int month)
        => await QueryWithCategory()
            .FirstOrDefaultAsync(b => b.CategoryId == categoryId
                                   && b.Year == year
                                   && b.Month == month);

    public async Task<bool> ExistsAsync(Guid categoryId, int year, int month)
        => await _context.Budgets.AnyAsync(b => b.CategoryId == categoryId
                                             && b.Year == year
                                             && b.Month == month);

    // ========================
    // CRUD
    // ========================

    public async Task<Budget> CreateAsync(Budget budget)
    {
        budget.Id        = Guid.NewGuid();
        budget.CreatedAt = DateTime.UtcNow;
        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();

        // Reload navigation
        await _context.Entry(budget).Reference(b => b.Category).LoadAsync();
        return budget;
    }

    public async Task<Budget?> UpdateAsync(Budget budget)
    {
        var existing = await _context.Budgets.FindAsync(budget.Id);
        if (existing is null) return null;

        existing.PlannedAmount = budget.PlannedAmount;
        existing.Note          = budget.Note;
        existing.UpdatedAt     = budget.UpdatedAt ?? DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _context.Entry(existing).Reference(b => b.Category).LoadAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _context.Budgets.FindAsync(id);
        if (entity is null) return false;

        _context.Budgets.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Budget>> BulkUpsertAsync(IEnumerable<Budget> budgets)
    {
        var result = new List<Budget>();

        foreach (var budget in budgets)
        {
            if (budget.Id == Guid.Empty)
            {
                // Create
                budget.Id        = Guid.NewGuid();
                budget.CreatedAt = DateTime.UtcNow;
                _context.Budgets.Add(budget);
                result.Add(budget);
            }
            else
            {
                // Update
                _context.Budgets.Update(budget);
                result.Add(budget);
            }
        }

        await _context.SaveChangesAsync();

        // Reload navigations
        foreach (var b in result)
            await _context.Entry(b).Reference(x => x.Category).LoadAsync();

        return result;
    }

    // ========================
    // Spending aggregates (query Transactions)
    // ========================

    public async Task<IEnumerable<(Guid CategoryId, decimal SpentAmount)>>
        GetSpendingByCategoryAsync(int year, int month)
    {
        var grouped = await _context.Transactions
            .Where(t => t.Type       == TransactionType.Expense
                     && t.Date.Year  == year
                     && t.Date.Month == month)
            .GroupBy(t => t.CategoryId)
            .Select(g => new
            {
                CategoryId  = g.Key,
                SpentAmount = g.Sum(t => t.Amount)
            })
            .ToListAsync();

        return grouped.Select(g => (g.CategoryId, g.SpentAmount));
    }

    public async Task<decimal> GetSpentAmountAsync(Guid categoryId, int year, int month)
        => await _context.Transactions
            .Where(t => t.CategoryId  == categoryId
                     && t.Type        == TransactionType.Expense
                     && t.Date.Year   == year
                     && t.Date.Month  == month)
            .SumAsync(t => (decimal?)t.Amount) ?? 0;
}