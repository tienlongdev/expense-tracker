namespace ExpenseTracker.Application.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    bool IsAuthenticated { get; }
    void SetOverrideUserId(Guid? userId);
    void ClearOverrideUserId();
}
