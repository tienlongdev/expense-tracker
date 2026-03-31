import SwiftUI

// SummaryCardView is kept for backward compatibility but styled to match the dark theme
struct SummaryCardView: View {
    let title: String
    let amount: Double
    let icon: String
    let tint: Color
    var subtitle: String? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(tint)
                    .padding(7)
                    .background(tint.opacity(0.15), in: Circle())
                Spacer()
            }
            Text(amount.currency)
                .font(.title3.bold())
                .foregroundStyle(Color.textPrimary)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(title)
                .font(.caption.weight(.medium))
                .foregroundStyle(Color.textSecondary)
            if let subtitle {
                Text(subtitle)
                    .font(.caption2)
                    .foregroundStyle(Color.textTertiary)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .glassCard()
    }
}

#Preview {
    ZStack {
        Color.appBackground.ignoresSafeArea()
        HStack {
            SummaryCardView(title: "Thu nhập", amount: 5_000_000, icon: "arrow.down.circle.fill", tint: Color.incomeGreen)
            SummaryCardView(title: "Chi tiêu", amount: 2_300_000, icon: "arrow.up.circle.fill", tint: Color.expenseRed)
        }
        .padding()
    }
}
