using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; }

    public NotificationType Type { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;

    /// <summary>
    /// Key dùng để dedup, ngăn tạo trùng cùng loại notification trong cùng kỳ.
    /// VD: "budget:{categoryId}:{year}:{month}:50" | "weekly:{year}:{isoWeek}"
    /// Nullable — SalaryReceived không cần dedup.
    /// </summary>
    public string? DeduplicationKey { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
