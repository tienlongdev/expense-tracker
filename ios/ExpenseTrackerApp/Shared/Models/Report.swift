import Foundation

// MARK: - Monthly Report (from GET /api/transaction/report/yearly)

struct MonthlyReport: Codable, Identifiable {
    var id: Int { month }
    let month: Int
    let totalIncome: Double
    let totalExpense: Double
    let balance: Double

    var monthName: String {
        let df = DateFormatter()
        df.dateFormat = "MMM"
        var comps = DateComponents()
        comps.month = month
        comps.year = 2000
        if let date = Calendar.current.date(from: comps) {
            return df.string(from: date)
        }
        return "\(month)"
    }
}
