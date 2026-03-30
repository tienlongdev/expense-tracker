import SwiftUI

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
                    .foregroundStyle(tint)
                Text(title)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Text(amount.currency)
                .font(.title3.bold())
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            if let subtitle {
                Text(subtitle)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
    }
}

#Preview {
    HStack {
        SummaryCardView(title: "Income", amount: 5_000_000, icon: "arrow.down.circle.fill", tint: .green)
        SummaryCardView(title: "Expense", amount: 2_300_000, icon: "arrow.up.circle.fill", tint: .red)
    }
    .padding()
}
