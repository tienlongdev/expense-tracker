using ExpenseTracker.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Application.DTOs;

// Response
public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public TransactionType Type { get; set; }
    public string TypeName => Type.ToString();
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Create
public class CreateCategoryDto
{
    [Required(ErrorMessage = "Tên danh mục không được để trống")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Icon { get; set; }

    [MaxLength(20)]
    public string? Color { get; set; }

    [Required]
    public TransactionType Type { get; set; }
}

// Update
public class UpdateCategoryDto
{
    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(50)]
    public string? Icon { get; set; }

    [MaxLength(20)]
    public string? Color { get; set; }

    public TransactionType? Type { get; set; }
}