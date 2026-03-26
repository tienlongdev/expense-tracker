using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Interfaces;
using ExpenseTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;

    public NotificationRepository(AppDbContext context) => _context = context;

    // ========================
    // Query
    // ========================

    public async Task<IEnumerable<Notification>> GetAllAsync(bool onlyUnread = false)
    {
        var query = _context.Notifications.AsNoTracking();
        if (onlyUnread) query = query.Where(n => !n.IsRead);
        return await query.OrderByDescending(n => n.CreatedAt).ToListAsync();
    }

    public async Task<Notification?> GetByIdAsync(Guid id)
        => await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id);

    public async Task<int> GetUnreadCountAsync()
        => await _context.Notifications.CountAsync(n => !n.IsRead);

    public async Task<bool> ExistsByDeduplicationKeyAsync(string key)
        => await _context.Notifications.AnyAsync(n => n.DeduplicationKey == key);

    // ========================
    // CRUD
    // ========================

    public async Task<Notification> CreateAsync(Notification notification)
    {
        notification.Id        = Guid.NewGuid();
        notification.CreatedAt = DateTime.UtcNow;
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
        return notification;
    }

    public async Task<bool> MarkAsReadAsync(Guid id)
    {
        var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id);
        if (notification is null) return false;

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync()
    {
        await _context.Notifications
            .Where(n => !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id);
        if (notification is null) return false;

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return true;
    }
}
