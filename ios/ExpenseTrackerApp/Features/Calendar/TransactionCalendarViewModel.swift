import Foundation

@MainActor
final class TransactionCalendarViewModel: ObservableObject {
    @Published var transactions: [Transaction] = []
    @Published var selectedDate: Date? = nil
    @Published var isLoading = false
    @Published var error: String?

    @Published var year: Int = Calendar.current.component(.year, from: .now)
    @Published var month: Int = Calendar.current.component(.month, from: .now)

    private let client = APIClient.shared

    var selectedDayTransactions: [Transaction] {
        guard let d = selectedDate else { return [] }
        let cal = Calendar.current
        return transactions.filter { tx in
            guard let txDate = tx.date.asDate else { return false }
            return cal.isDate(txDate, inSameDayAs: d)
        }
    }

    /// Returns a set of date strings (yyyy-MM-dd) that have income transactions
    var incomeDates: Set<String> {
        Set(transactions.filter { $0.type == .income }.compactMap { shortKey($0.date) })
    }

    /// Returns a set of date strings (yyyy-MM-dd) that have expense transactions
    var expenseDates: Set<String> {
        Set(transactions.filter { $0.type == .expense }.compactMap { shortKey($0.date) })
    }

    var monthIncome: Double {
        transactions.filter { $0.type == .income }.reduce(0) { $0 + $1.amount }
    }

    var monthExpense: Double {
        transactions.filter { $0.type == .expense }.reduce(0) { $0 + $1.amount }
    }

    var monthBalance: Double { monthIncome - monthExpense }

    func load() async {
        isLoading = true
        error = nil
        do {
            let result: [Transaction] = try await client.get(
                "/api/transaction/filter/month",
                queryItems: [
                    .init(name: "year", value: "\(year)"),
                    .init(name: "month", value: "\(month)")
                ]
            )
            transactions = result
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    private func shortKey(_ isoDate: String) -> String? {
        guard let d = isoDate.asDate else { return nil }
        let df = DateFormatter()
        df.dateFormat = "yyyy-MM-dd"
        return df.string(from: d)
    }
}
