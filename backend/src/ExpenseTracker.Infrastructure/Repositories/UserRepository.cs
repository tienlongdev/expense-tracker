using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Interfaces;
using ExpenseTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<User>> GetAllAsync()
        => await _context.Users
            .AsNoTracking()
            .OrderBy(x => x.CreatedAt)
            .ToListAsync();

    public async Task<User?> GetByIdAsync(Guid id)
        => await _context.Users.FirstOrDefaultAsync(x => x.Id == id);

    public async Task<User?> GetByEmailAsync(string email)
        => await _context.Users.FirstOrDefaultAsync(x => x.Email == email.Trim().ToLowerInvariant());

    public async Task<bool> EmailExistsAsync(string email)
        => await _context.Users.AnyAsync(x => x.Email == email.Trim().ToLowerInvariant());

    public async Task<User> CreateAsync(User user)
    {
        user.Id = Guid.NewGuid();
        user.Email = user.Email.Trim().ToLowerInvariant();
        user.CreatedAt = DateTime.UtcNow;

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User?> UpdateAsync(User user)
    {
        var existing = await _context.Users.FirstOrDefaultAsync(x => x.Id == user.Id);
        if (existing is null)
        {
            return null;
        }

        existing.FullName = user.FullName;
        existing.PreferredCurrency = user.PreferredCurrency;
        existing.TimeZone = user.TimeZone;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existing;
    }
}
