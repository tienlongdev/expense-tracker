namespace ExpenseTracker.Domain.Enums;

public enum DebtStatus
{
    Unpaid        = 1, // Chưa trả
    PartiallyPaid = 2, // Đã trả một phần
    Paid          = 3  // Đã trả hết
}