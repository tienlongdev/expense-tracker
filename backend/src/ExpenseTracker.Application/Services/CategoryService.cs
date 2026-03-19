using ExpenseTracker.Application.DTOs;
using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Domain.Entities;
using ExpenseTracker.Domain.Enums;
using ExpenseTracker.Domain.Interfaces;

namespace ExpenseTracker.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;

    public CategoryService(ICategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync()
    {
        var items = await _repository.GetAllAsync();
        return items.Select(MapToDto);
    }

    public async Task<CategoryDto?> GetByIdAsync(Guid id)
    {
        var item = await _repository.GetByIdAsync(id);
        return item is null ? null : MapToDto(item);
    }

    public async Task<IEnumerable<CategoryDto>> GetByTypeAsync(TransactionType type)
    {
        var items = await _repository.GetByTypeAsync(type);
        return items.Select(MapToDto);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
        var entity = new Category
        {
            Name    = dto.Name,
            Icon    = dto.Icon,
            Color   = dto.Color,
            Type    = dto.Type,
            IsDefault = false
        };

        var created = await _repository.CreateAsync(entity);
        return MapToDto(created);
    }

    public async Task<CategoryDto?> UpdateAsync(Guid id, UpdateCategoryDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing is null) return null;

        if (dto.Name  is not null) existing.Name  = dto.Name;
        if (dto.Icon  is not null) existing.Icon  = dto.Icon;
        if (dto.Color is not null) existing.Color = dto.Color;
        if (dto.Type.HasValue)     existing.Type  = dto.Type.Value;
        existing.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(existing);
        return updated is null ? null : MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing is null) return false;
        if (existing.IsDefault)
            throw new InvalidOperationException("Không thể xoá danh mục mặc định.");

        return await _repository.DeleteAsync(id);
    }

    private static CategoryDto MapToDto(Category c) => new()
    {
        Id        = c.Id,
        Name      = c.Name,
        Icon      = c.Icon,
        Color     = c.Color,
        Type      = c.Type,
        IsDefault = c.IsDefault,
        CreatedAt = c.CreatedAt
    };
}