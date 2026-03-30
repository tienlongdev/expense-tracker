import SwiftUI

struct TransactionRowView: View {
    let transaction: Transaction

    var body: some View {
        HStack(spacing: 12) {
            categoryIcon
            info
            Spacer()
            amountLabel
        }
        .padding(.vertical, 4)
    }

    private var categoryIcon: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 10)
                .fill(Color(hex: transaction.categoryColor).opacity(0.15))
                .frame(width: 42, height: 42)
            Text(transaction.categoryIcon)
                .font(.title3)
        }
    }

    private var info: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(transaction.title)
                .font(.subheadline.weight(.medium))
                .lineLimit(1)
            Text(transaction.categoryName)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(transaction.date.shortDate)
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
    }

    private var amountLabel: some View {
        Text(amountText)
            .font(.subheadline.bold())
            .foregroundStyle(transaction.type == .income ? .green : .red)
    }

    private var amountText: String {
        let sign = transaction.type == .income ? "+" : "-"
        return "\(sign)\(transaction.amount.currency)"
    }
}

#Preview {
    let tx = Transaction(
        id: "1", title: "Grocery", amount: 250_000,
        type: .expense, typeName: "Expense",
        categoryId: "c1", categoryName: "Food", categoryIcon: "🍔", categoryColor: "#FF5733",
        date: "2024-03-15T00:00:00", note: nil, createdAt: "2024-03-15T12:00:00", updatedAt: nil
    )
    TransactionRowView(transaction: tx)
        .padding()
}
