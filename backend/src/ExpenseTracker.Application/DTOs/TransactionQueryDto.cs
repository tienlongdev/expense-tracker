using ExpenseTracker.Domain.Enums;

namespace ExpenseTracker.Application.DTOs;

public class TransactionQueryDto
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public TransactionType? Type { get; init; }
    public string? Title { get; init; }
}
