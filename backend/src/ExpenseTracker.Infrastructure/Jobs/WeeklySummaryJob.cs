using ExpenseTracker.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quartz;

namespace ExpenseTracker.Infrastructure.Jobs;

/// <summary>
/// Quartz.NET job chạy mỗi Chủ nhật — tạo notification tổng kết chi tiêu tuần.
/// Dùng IServiceScopeFactory vì Quartz job là Singleton còn INotificationService là Scoped.
/// </summary>
[DisallowConcurrentExecution]
public class WeeklySummaryJob : IJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<WeeklySummaryJob> _logger;

    public WeeklySummaryJob(IServiceScopeFactory scopeFactory, ILogger<WeeklySummaryJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger       = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        _logger.LogInformation("[WeeklySummaryJob] Starting at {Time}", DateTime.UtcNow);

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var notificationService = scope.ServiceProvider
                .GetRequiredService<INotificationService>();

            // Tuần kết thúc hôm nay (Chủ nhật), bắt đầu từ Thứ 2 (6 ngày trước)
            var today     = DateTime.UtcNow.Date;
            var weekEnd   = today;
            var weekStart = today.AddDays(-6);

            await notificationService.TriggerWeeklySummaryAsync(weekStart, weekEnd);

            _logger.LogInformation("[WeeklySummaryJob] Completed. Week: {Start} – {End}",
                weekStart.ToString("dd/MM"), weekEnd.ToString("dd/MM"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[WeeklySummaryJob] Failed");
        }
    }
}
