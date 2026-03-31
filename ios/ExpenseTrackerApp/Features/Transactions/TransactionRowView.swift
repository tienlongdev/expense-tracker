import SwiftUI

struct TransactionRowView: View {
    let transaction: Transaction

    var body: some View {
        HStack(spacing: 14) {
            iconView
            infoView
            Spacer()
            amountView
        }
    }

    private var iconView: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(iconBackground)
                .frame(width: 44, height: 44)
            Text(transaction.categoryIcon ?? "💰")
                .font(.system(size: 20))
        }
    }

    private var iconBackground: some ShapeStyle {
        let hex = transaction.categoryColor ?? "#888888"
        return Color(hex: hex).opacity(0.18)
    }

    private var infoView: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(transaction.title)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Color.textPrimary)
                .lineLimit(1)
            Text(transaction.categoryName)
                .font(.caption.weight(.medium))
                .foregroundStyle(Color.textSecondary)
            Text(transaction.date.numericDate)
                .font(.caption2)
                .foregroundStyle(Color.textTertiary)
        }
    }

    private var amountView: some View {
        VStack(alignment: .trailing, spacing: 2) {
            Text(amountText)
                .font(.subheadline.bold())
                .foregroundStyle(transaction.type == .income ? Color.incomeGreen : Color.expenseRed)
            Text(transaction.type.displayName)
                .font(.caption2)
                .foregroundStyle(Color.textTertiary)
        }
    }

    private var amountText: String {
        let sign = transaction.type == .income ? "+" : "-"
        return "\(sign)\(transaction.amount.currency)"
    }
}

#Preview {
    let tx = Transaction(
        id: "1", title: "Ăn sáng", amount: 75_000,
        type: .expense, typeName: "Chi tiêu",
        categoryId: "c1", categoryName: "Ăn uống",
        categoryIcon: "🍜", categoryColor: "#FF5722",
        date: "2024-03-15T00:00:00", note: nil,
        createdAt: "2024-03-15T12:00:00", updatedAt: nil
    )
    ZStack {
        Color.appBackground.ignoresSafeArea()
        TransactionRowView(transaction: tx)
            .padding()
    }
}
