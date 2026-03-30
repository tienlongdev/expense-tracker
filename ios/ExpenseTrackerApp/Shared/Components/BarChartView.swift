import SwiftUI
import Charts

// MARK: - Monthly Income/Expense Bar Chart

struct BarChartView: View {
    let data: [MonthlyReport]

    var body: some View {
        Chart {
            ForEach(data) { item in
                BarMark(
                    x: .value("Month", item.monthName),
                    y: .value("Income", item.totalIncome)
                )
                .foregroundStyle(.green.gradient)
                .cornerRadius(4)
                .position(by: .value("Type", "Income"))

                BarMark(
                    x: .value("Month", item.monthName),
                    y: .value("Expense", item.totalExpense)
                )
                .foregroundStyle(.red.gradient)
                .cornerRadius(4)
                .position(by: .value("Type", "Expense"))
            }
        }
        .chartLegend(.visible)
        .chartYAxis {
            AxisMarks(position: .leading) { value in
                AxisValueLabel {
                    if let v = value.as(Double.self) {
                        Text(v.formatted)
                            .font(.caption2)
                    }
                }
            }
        }
    }
}

// MARK: - Budget Progress Bar

struct BudgetProgressBar: View {
    let percent: Double
    let isOverBudget: Bool
    let isNearLimit: Bool

    private var progressColor: Color {
        if isOverBudget { return .red }
        if isNearLimit { return .orange }
        return .green
    }

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(Color(.systemFill))
                Capsule()
                    .fill(progressColor.gradient)
                    .frame(width: min(CGFloat(percent / 100) * geo.size.width, geo.size.width))
            }
        }
        .frame(height: 8)
    }
}

#Preview {
    let sample = [
        MonthlyReport(month: 1, totalIncome: 8_000_000, totalExpense: 4_000_000, balance: 4_000_000),
        MonthlyReport(month: 2, totalIncome: 9_000_000, totalExpense: 5_500_000, balance: 3_500_000),
        MonthlyReport(month: 3, totalIncome: 7_500_000, totalExpense: 6_000_000, balance: 1_500_000),
    ]
    BarChartView(data: sample)
        .frame(height: 220)
        .padding()
}
