import Foundation

@MainActor
final class ReportsViewModel: ObservableObject {
    @Published var yearlyReport: [MonthlyReport] = []
    @Published var yearlySummary: SummaryDto?
    @Published var isLoading = false
    @Published var error: String?
    @Published var selectedYear: Int = Calendar.current.component(.year, from: .now)

    private let client = APIClient.shared

    func load() async {
        isLoading = true
        error = nil
        do {
            async let reportReq: [MonthlyReport] = client.get(
                "/api/transaction/report/yearly",
                queryItems: [.init(name: "year", value: "\(selectedYear)")]
            )
            async let summaryReq: SummaryDto = client.get(
                "/api/transaction/summary/year",
                queryItems: [.init(name: "year", value: "\(selectedYear)")]
            )
            let (report, summary) = try await (reportReq, summaryReq)
            yearlyReport = report
            yearlySummary = summary
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}
