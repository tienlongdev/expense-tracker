using System.Security.Claims;
using ExpenseTracker.Application.Interfaces;

namespace ExpenseTracker.API.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private Guid? _overrideUserId;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            if (_overrideUserId.HasValue)
            {
                return _overrideUserId;
            }

            var rawValue = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name)
                ?? _httpContextAccessor.HttpContext?.User.FindFirstValue("sub");

            return Guid.TryParse(rawValue, out var userId) ? userId : null;
        }
    }

    public bool IsAuthenticated => UserId.HasValue;

    public void SetOverrideUserId(Guid? userId)
    {
        _overrideUserId = userId;
    }

    public void ClearOverrideUserId()
    {
        _overrideUserId = null;
    }
}
