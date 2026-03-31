import SwiftUI
import Charts

// MARK: - Monthly Income/Expense Bar Chart

struct BarChartView: View {
    let data: [MonthlyReport]

    var body: some View {
        Chart {
            ForEach(data) { item in
                BarMark(
                    x: .value("Tháng", item.monthName),
                    y: .value("Thu nhập", item.totalIncome)
                )
                .foregroundStyle(
                    LinearGradient(
                        colors: [Color(hex: "#00C897"), Color(hex: "#00A86B")],
                        startPoint: .bottom, endPoint: .top
                    )
                )
                .cornerRadius(4)
                .position(by: .value("Loại", "Thu nhập"))

                BarMark(
                    x: .value("Tháng", item.monthName),
                    y: .value("Chi tiêu", item.totalExpense)
                )
                .foregroundStyle(
                    LinearGradient(
                        colors: [Color(hex: "#FF6B6B"), Color(hex: "#EE2A7B")],
                        startPoint: .bottom, endPoint: .top
                    )
                )
                .cornerRadius(4)
                .position(by: .value("Loại", "Chi tiêu"))
            }
        }
        .chartLegend(.visible)
        .chartLegend(position: .top, alignment: .trailing)
        .chartXAxis {
            AxisMarks { value in
                AxisValueLabel {
                    if let v = value.as(String.self) {
                        Text(v)
                            .font(.caption2)
                            .foregroundStyle(Color.textTertiary)
                    }
                }
            }
        }
        .chartYAxis {
            AxisMarks(position: .leading) { value in
                AxisGridLine()
                    .foregroundStyle(Color.borderColor.opacity(0.5))
                AxisValueLabel {
                    if let v = value.as(Double.self) {
                        Text(v.formatted)
                            .font(.caption2)
                            .foregroundStyle(Color.textTertiary)
                    }
                }
            }
        }
        .chartBackground { _ in
            Color.clear
        }
    }
}

// MARK: - Budget Progress Bar

struct BudgetProgressBar: View {
    let percent: Double
    let isOverBudget: Bool
    let isNearLimit: Bool

    private var progressGradient: LinearGradient {
        if isOverBudget {
            return LinearGradient(
                colors: [Color(hex: "#FF6B6B"), Color(hex: "#EE2A7B")],
                startPoint: .leading, endPoint: .trailing
            )
        }
        if isNearLimit {
            return LinearGradient(
                colors: [Color.orange, Color.yellow],
                startPoint: .leading, endPoint: .trailing
            )
        }
        return LinearGradient(
            colors: [Color(hex: "#00C897"), Color(hex: "#00A86B")],
            startPoint: .leading, endPoint: .trailing
        )
    }

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(Color.surfaceColor)
                Capsule()
                    .fill(progressGradient)
                    .frame(width: min(CGFloat(percent / 100) * geo.size.width, geo.size.width))
                    .animation(.spring(response: 0.5), value: percent)
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
    ZStack {
        Color.appBackground.ignoresSafeArea()
        BarChartView(data: sample)
            .frame(height: 220)
            .padding()
    }
}
