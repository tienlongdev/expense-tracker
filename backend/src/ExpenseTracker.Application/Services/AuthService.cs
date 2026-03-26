using ExpenseTracker.Application.DTOs;
using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;

namespace ExpenseTracker.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICategoryRepository _categoryRepository;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasherService passwordHasher,
        IJwtTokenService jwtTokenService,
        ICurrentUserService currentUserService,
        ICategoryRepository categoryRepository)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _currentUserService = currentUserService;
        _categoryRepository = categoryRepository;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        if (await _userRepository.EmailExistsAsync(normalizedEmail))
        {
            throw new InvalidOperationException("Email đã tồn tại.");
        }

        var user = await _userRepository.CreateAsync(new User
        {
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(dto.Password),
            FullName = dto.FullName.Trim()
        });

        await SeedDefaultCategoriesAsync(user.Id);

        return new AuthResponseDto
        {
            AccessToken = _jwtTokenService.GenerateToken(user),
            User = MapToDto(user)
        };
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user is null || !_passwordHasher.VerifyPassword(dto.Password, user.PasswordHash))
        {
            return null;
        }

        return new AuthResponseDto
        {
            AccessToken = _jwtTokenService.GenerateToken(user),
            User = MapToDto(user)
        };
    }

    public async Task<UserProfileDto?> GetProfileAsync()
    {
        if (!_currentUserService.UserId.HasValue)
        {
            return null;
        }

        var user = await _userRepository.GetByIdAsync(_currentUserService.UserId.Value);
        return user is null ? null : MapToDto(user);
    }

    public async Task<UserProfileDto?> UpdateProfileAsync(UpdateUserProfileDto dto)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            return null;
        }

        var existing = await _userRepository.GetByIdAsync(_currentUserService.UserId.Value);
        if (existing is null)
        {
            return null;
        }

        existing.FullName = dto.FullName.Trim();
        existing.PreferredCurrency = dto.PreferredCurrency.Trim().ToUpperInvariant();
        existing.TimeZone = dto.TimeZone.Trim();

        var updated = await _userRepository.UpdateAsync(existing);
        return updated is null ? null : MapToDto(updated);
    }

    private async Task SeedDefaultCategoriesAsync(Guid userId)
    {
        _currentUserService.SetOverrideUserId(userId);

        try
        {
            var existing = await _categoryRepository.GetAllAsync();
            if (existing.Any())
            {
                return;
            }

            var now = DateTime.UtcNow;
            var categories = new[]
            {
                new Category { Name = "Lương", Icon = "💰", Color = "#4CAF50", Type = TransactionType.Income, IsDefault = true, CreatedAt = now },
                new Category { Name = "Thu nhập phụ", Icon = "💵", Color = "#8BC34A", Type = TransactionType.Income, IsDefault = true, CreatedAt = now },
                new Category { Name = "Đầu tư", Icon = "📈", Color = "#2196F3", Type = TransactionType.Income, IsDefault = true, CreatedAt = now },
                new Category { Name = "Quà tặng / Thưởng", Icon = "🎁", Color = "#9C27B0", Type = TransactionType.Income, IsDefault = true, CreatedAt = now },
                new Category { Name = "Ăn uống", Icon = "🍜", Color = "#FF5722", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
                new Category { Name = "Chi tiêu hàng ngày", Icon = "🛒", Color = "#FF9800", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
                new Category { Name = "Quần áo", Icon = "👗", Color = "#E91E63", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
                new Category { Name = "Mỹ phẩm", Icon = "💄", Color = "#F06292", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
                new Category { Name = "Phí giao lưu", Icon = "🎉", Color = "#BA68C8", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
                new Category { Name = "Y tế", Icon = "🏥", Color = "#00BCD4", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
                new Category { Name = "Giáo dục", Icon = "📚", Color = "#3F51B5", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
                new Category { Name = "Tiền nhà", Icon = "🏠", Color = "#795548", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
                new Category { Name = "Đi lại", Icon = "🚗", Color = "#607D8B", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
                new Category { Name = "Cưới hỏi tiệc tùng", Icon = "💍", Color = "#FF4081", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
                new Category { Name = "Điện / Nước / Internet", Icon = "⚡", Color = "#FFC107", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now },
                new Category { Name = "Giải trí", Icon = "🎮", Color = "#00E676", Type = TransactionType.Expense, IsDefault = true, CreatedAt = now }
            };

            foreach (var category in categories)
            {
                await _categoryRepository.CreateAsync(category);
            }
        }
        finally
        {
            _currentUserService.ClearOverrideUserId();
        }
    }

    private static UserProfileDto MapToDto(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FullName = user.FullName,
        PreferredCurrency = user.PreferredCurrency,
        TimeZone = user.TimeZone,
        CreatedAt = user.CreatedAt
    };
}
