namespace ExpenseTracker.Domain.Entities;

public class User
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string PreferredCurrency { get; set; } = "VND";

    public string TimeZone { get; set; } = "Asia/Saigon";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<Category> Categories { get; set; } = [];

    public ICollection<Transaction> Transactions { get; set; } = [];

    public ICollection<Debt> Debts { get; set; } = [];

    public ICollection<DebtPayment> DebtPayments { get; set; } = [];

    public ICollection<SavingsAccount> SavingsAccounts { get; set; } = [];

    public ICollection<SavingsHistory> SavingsHistories { get; set; } = [];

    public ICollection<Budget> Budgets { get; set; } = [];

    public ICollection<Notification> Notifications { get; set; } = [];
}
