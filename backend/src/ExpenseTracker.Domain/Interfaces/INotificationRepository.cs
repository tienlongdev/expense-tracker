using ExpenseTracker.Domain.Entities;

namespace ExpenseTracker.Domain.Interfaces;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetAllAsync(bool onlyUnread = false);
    Task<Notification?> GetByIdAsync(Guid id);
    Task<Notification> CreateAsync(Notification notification);
    Task<bool> MarkAsReadAsync(Guid id);
    Task<bool> MarkAllAsReadAsync();
    Task<bool> DeleteAsync(Guid id);

    /// <summary>Kiểm tra dedup key đã tồn tại chưa để tránh tạo trùng notification.</summary>
    Task<bool> ExistsByDeduplicationKeyAsync(string key);

    Task<int> GetUnreadCountAsync();
}
