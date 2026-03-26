using ExpenseTracker.Domain.Entities;

namespace ExpenseTracker.Domain.Interfaces;

public interface IUserRepository
{
    Task<IEnumerable<User>> GetAllAsync();
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email);
    Task<User> CreateAsync(User user);
    Task<User?> UpdateAsync(User user);
}
