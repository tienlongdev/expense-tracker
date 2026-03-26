namespace ExpenseTracker.Domain.Entities;

public interface IUserOwnedEntity
{
    Guid UserId { get; set; }
    User? User { get; set; }
}
