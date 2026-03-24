using ExpenseTracker.Application.DTOs;
using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;

namespace ExpenseTracker.Application.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repo;
    private readonly IBudgetRepository       _budgetRepo;
    private readonly ITransactionRepository  _transactionRepo;

    /// <summary>Ba mốc cảnh báo ngân sách tính bằng %.</summary>
    private static readonly int[] BudgetMilestones = [50, 80, 100];

    /// <summary>CategoryId "Lương" được seed cố định trong Program.cs.</summary>
    private static readonly Guid SalaryCategoryId = new("10000000-0000-0000-0000-000000000001");

    public NotificationService(
        INotificationRepository repo,
        IBudgetRepository       budgetRepo,
        ITransactionRepository  transactionRepo)
    {
        _repo            = repo;
        _budgetRepo      = budgetRepo;
        _transactionRepo = transactionRepo;
    }

    // ========================
    // Query
    // ========================

    public async Task<IEnumerable<NotificationDto>> GetAllAsync(bool onlyUnread = false)
    {
        var items = await _repo.GetAllAsync(onlyUnread);
        return items.Select(MapToDto);
    }

    public Task<int> GetUnreadCountAsync()
        => _repo.GetUnreadCountAsync();

    // ========================
    // Actions
    // ========================

    public Task<bool> MarkAsReadAsync(Guid id)    => _repo.MarkAsReadAsync(id);
    public Task<bool> MarkAllAsReadAsync()         => _repo.MarkAllAsReadAsync();
    public Task<bool> DeleteAsync(Guid id)         => _repo.DeleteAsync(id);

    // ========================
    // Triggers
    // ========================

    /// <summary>
    /// Gọi sau khi tạo/sửa/xoá Transaction expense.
    /// Kiểm tra từng milestone 50/80/100% cho category có budget tháng này.
    /// Mỗi milestone chỉ tạo 1 notification duy nhất trong tháng (dedup by key).
    /// </summary>
    public async Task TriggerBudgetAlertsAsync(Guid categoryId, int year, int month)
    {
        var budget = await _budgetRepo.GetByCategoryAndMonthAsync(categoryId, year, month);
        if (budget is null || budget.PlannedAmount <= 0) return;

        var spent        = await _budgetRepo.GetSpentAmountAsync(categoryId, year, month);
        var percentage   = spent / budget.PlannedAmount * 100;
        var categoryName = budget.Category?.Name ?? "danh mục";

        foreach (var milestone in BudgetMilestones)
        {
            if (percentage < milestone) continue;

            var dedupKey = $"budget:{categoryId}:{year}:{month}:{milestone}";
            if (await _repo.ExistsByDeduplicationKeyAsync(dedupKey)) continue;

            var (title, message) = BuildBudgetAlertMessage(milestone, categoryName, spent, budget.PlannedAmount, month, year);
            if (string.IsNullOrEmpty(title)) continue;

            await _repo.CreateAsync(new Notification
            {
                Type             = NotificationType.BudgetAlert,
                Title            = title,
                Message          = message,
                DeduplicationKey = dedupKey
            });
        }
    }

    /// <summary>
    /// Gọi khi tạo Transaction Income với CategoryId = SalaryCategoryId (Lương).
    /// Không dedup — mỗi lần nhận lương là 1 notification độc lập.
    /// </summary>
    public async Task TriggerSalaryReceivedAsync(decimal amount, DateTime date)
    {
        await _repo.CreateAsync(new Notification
        {
            Type    = NotificationType.SalaryReceived,
            Title   = "💰 Nhận lương thành công",
            Message = $"Đã ghi nhận {amount:N0}đ vào ngày {date:dd/MM/yyyy}. Chúc mừng tháng mới!"
        });
    }

    /// <summary>
    /// Gọi từ WeeklySummaryJob mỗi Chủ nhật.
    /// So sánh tổng chi tiêu tuần này với tuần trước.
    /// Dedup theo ISO week number.
    /// </summary>
    public async Task TriggerWeeklySummaryAsync(DateTime weekStart, DateTime weekEnd)
    {
        var weekNumber = System.Globalization.ISOWeek.GetWeekOfYear(weekStart);
        var dedupKey   = $"weekly:{weekStart.Year}:{weekNumber}";

        if (await _repo.ExistsByDeduplicationKeyAsync(dedupKey)) return;

        var thisWeekExpense = await GetRangeExpenseAsync(weekStart, weekEnd);
        var lastWeekExpense = await GetRangeExpenseAsync(weekStart.AddDays(-7), weekEnd.AddDays(-7));

        string message;
        if (lastWeekExpense == 0)
        {
            message = $"Chi tiêu tuần {weekStart:dd/MM} – {weekEnd:dd/MM}: {thisWeekExpense:N0}đ. " +
                      "Không có dữ liệu tuần trước để so sánh.";
        }
        else
        {
            var diff    = thisWeekExpense - lastWeekExpense;
            var pct     = Math.Round(Math.Abs(diff) / lastWeekExpense * 100, 1);
            var trend   = diff > 0 ? $"tăng {pct}% 📈" : $"giảm {pct}% 📉";
            message = $"Chi tiêu tuần {weekStart:dd/MM} – {weekEnd:dd/MM}: {thisWeekExpense:N0}đ, " +
                      $"{trend} so với tuần trước ({lastWeekExpense:N0}đ).";
        }

        await _repo.CreateAsync(new Notification
        {
            Type             = NotificationType.WeeklySummary,
            Title            = "📊 Tổng kết chi tiêu tuần",
            Message          = message,
            DeduplicationKey = dedupKey
        });
    }

    // ========================
    // Private helpers
    // ========================

    /// <summary>
    /// Tổng chi tiêu (Expense) trong khoảng [start, end].
    /// Dùng GetPagedAsync với pageSize lớn — phù hợp project cá nhân.
    /// </summary>
    private async Task<decimal> GetRangeExpenseAsync(DateTime start, DateTime end)
    {
        var (items, _) = await _transactionRepo.GetPagedAsync(
            page: 1,
            pageSize: int.MaxValue,
            fromDate: start.Date,
            toDate: end.Date,
            type: TransactionType.Expense,
            title: null
        );
        return items.Sum(t => t.Amount);
    }

    private static (string title, string message) BuildBudgetAlertMessage(
        int milestone, string categoryName, decimal spent, decimal planned, int month, int year)
        => milestone switch
        {
            50  => ($"⚠️ Đã dùng 50% ngân sách {categoryName}",
                    $"Bạn đã chi {spent:N0}đ / {planned:N0}đ ngân sách tháng {month}/{year}."),
            80  => ($"🔴 Sắp vượt ngân sách {categoryName}",
                    $"Đã dùng {spent:N0}đ — còn {planned - spent:N0}đ trước khi vượt mức {planned:N0}đ."),
            100 => ($"🚨 Vượt ngân sách {categoryName}!",
                    $"Đã chi {spent:N0}đ — vượt {spent - planned:N0}đ so với kế hoạch {planned:N0}đ tháng {month}/{year}."),
            _   => (string.Empty, string.Empty)
        };

    // ========================
    // Mapping
    // ========================

    private static NotificationDto MapToDto(Notification n) => new()
    {
        Id        = n.Id,
        Type      = n.Type,
        Title     = n.Title,
        Message   = n.Message,
        IsRead    = n.IsRead,
        CreatedAt = n.CreatedAt
    };
}
