using ExpenseTracker.Application.DTOs;

namespace ExpenseTracker.Application.Interfaces;

public interface INotificationService
{
    // Query
    Task<IEnumerable<NotificationDto>> GetAllAsync(bool onlyUnread = false);
    Task<int> GetUnreadCountAsync();

    // Actions
    Task<bool> MarkAsReadAsync(Guid id);
    Task<bool> MarkAllAsReadAsync();
    Task<bool> DeleteAsync(Guid id);

    // Trigger — gọi nội bộ từ TransactionService và WeeklySummaryJob
    Task TriggerBudgetAlertsAsync(Guid categoryId, int year, int month);
    Task TriggerSalaryReceivedAsync(decimal amount, DateTime date);
    Task TriggerWeeklySummaryAsync(DateTime weekStart, DateTime weekEnd);
}
