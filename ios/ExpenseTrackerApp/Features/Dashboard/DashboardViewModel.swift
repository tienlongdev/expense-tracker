import Foundation

@MainActor
final class DashboardViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var error: String?
    @Published var summary: SummaryDto?
    @Published var recentTransactions: [Transaction] = []
    @Published var yearlyReport: [MonthlyReport] = []

    @Published var selectedYear: Int = Calendar.current.component(.year, from: .now)
    @Published var selectedMonth: Int = Calendar.current.component(.month, from: .now)

    private let client = APIClient.shared

    func load() async {
        isLoading = true
        error = nil
        do {
            async let summaryReq: SummaryDto = client.get(
                "/api/transaction/summary/month",
                queryItems: [
                    .init(name: "year", value: "\(selectedYear)"),
                    .init(name: "month", value: "\(selectedMonth)")
                ]
            )
            async let recentReq: PagedResult<Transaction> = client.get(
                "/api/transaction",
                queryItems: [
                    .init(name: "page", value: "1"),
                    .init(name: "pageSize", value: "5")
                ]
            )
            async let reportReq: [MonthlyReport] = client.get(
                "/api/transaction/report/yearly",
                queryItems: [.init(name: "year", value: "\(selectedYear)")]
            )

            let (s, paged, report) = try await (summaryReq, recentReq, reportReq)
            summary = s
            recentTransactions = Array(paged.items.prefix(5))
            yearlyReport = report
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func loadOnMonthChange() async {
        // Reload only summary and chart when month selector changes
        error = nil
        do {
            async let summaryReq: SummaryDto = client.get(
                "/api/transaction/summary/month",
                queryItems: [
                    .init(name: "year", value: "\(selectedYear)"),
                    .init(name: "month", value: "\(selectedMonth)")
                ]
            )
            async let reportReq: [MonthlyReport] = client.get(
                "/api/transaction/report/yearly",
                queryItems: [.init(name: "year", value: "\(selectedYear)")]
            )
            let (s, report) = try await (summaryReq, reportReq)
            summary = s
            yearlyReport = report
        } catch {
            self.error = error.localizedDescription
        }
    }
}
