using ExpenseTracker.Domain.Entities;

namespace ExpenseTracker.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}
