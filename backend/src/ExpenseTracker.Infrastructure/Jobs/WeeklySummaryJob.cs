using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Domain.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quartz;

namespace ExpenseTracker.Infrastructure.Jobs;

[DisallowConcurrentExecution]
public class WeeklySummaryJob : IJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<WeeklySummaryJob> _logger;

    public WeeklySummaryJob(IServiceScopeFactory scopeFactory, ILogger<WeeklySummaryJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        _logger.LogInformation("[WeeklySummaryJob] Starting at {Time}", DateTime.UtcNow);

        try
        {
            using var usersScope = _scopeFactory.CreateScope();
            var userRepository = usersScope.ServiceProvider.GetRequiredService<IUserRepository>();
            var users = await userRepository.GetAllAsync();

            var today = DateTime.UtcNow.Date;
            var weekEnd = today;
            var weekStart = today.AddDays(-6);

            foreach (var user in users)
            {
                using var scope = _scopeFactory.CreateScope();
                var currentUserService = scope.ServiceProvider.GetRequiredService<ICurrentUserService>();
                currentUserService.SetOverrideUserId(user.Id);

                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                await notificationService.TriggerWeeklySummaryAsync(weekStart, weekEnd);
            }

            _logger.LogInformation(
                "[WeeklySummaryJob] Completed. Week: {Start} - {End}",
                weekStart.ToString("dd/MM"),
                weekEnd.ToString("dd/MM"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[WeeklySummaryJob] Failed");
        }
    }
}
