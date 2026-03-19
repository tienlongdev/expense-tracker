namespace ExpenseTracker.Domain.Enums;

public enum SavingsStatus
{
    Active  = 1, // Đang hoạt động
    Matured = 2, // Đáo hạn (tiết kiệm đến kỳ)
    Closed  = 3  // Đã đóng / tất toán
}