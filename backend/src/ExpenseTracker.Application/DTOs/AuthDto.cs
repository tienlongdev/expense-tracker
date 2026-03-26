using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Application.DTOs;

public class RegisterDto
{
    [Required(ErrorMessage = "Email không ðý?c ð? tr?ng")]
    [EmailAddress]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "M?t kh?u không ðý?c ð? tr?ng")]
    [MinLength(6)]
    [MaxLength(200)]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "H? tên không ðý?c ð? tr?ng")]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;
}

public class LoginDto
{
    [Required(ErrorMessage = "Email không ðý?c ð? tr?ng")]
    [EmailAddress]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "M?t kh?u không ðý?c ð? tr?ng")]
    [MaxLength(200)]
    public string Password { get; set; } = string.Empty;
}

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PreferredCurrency { get; set; } = "VND";
    public string TimeZone { get; set; } = "Asia/Saigon";
    public DateTime CreatedAt { get; set; }
}

public class UpdateUserProfileDto
{
    [Required(ErrorMessage = "H? tên không ðý?c ð? tr?ng")]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Ti?n t? không ðý?c ð? tr?ng")]
    [MaxLength(10)]
    public string PreferredCurrency { get; set; } = "VND";

    [Required(ErrorMessage = "Múi gi? không ðý?c ð? tr?ng")]
    [MaxLength(100)]
    public string TimeZone { get; set; } = "Asia/Saigon";
}

public class AuthResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
    public UserProfileDto User { get; set; } = new();
}
