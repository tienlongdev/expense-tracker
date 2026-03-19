namespace ExpenseTracker.Domain.Enums;

public enum SavingsTransactionType
{
    Deposit          = 1, // Nạp thêm vốn
    Withdrawal       = 2, // Rút vốn
    ValueUpdate      = 3, // Cập nhật giá trị (track lời/lỗ)
    InterestReceived = 4  // Nhận lãi suất
}