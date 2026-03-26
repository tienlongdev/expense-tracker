using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Domain.Entities;

public class Notification : IUserOwnedEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public string? DeduplicationKey { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
