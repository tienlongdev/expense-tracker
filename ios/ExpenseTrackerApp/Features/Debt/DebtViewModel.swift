import Foundation

@MainActor
final class DebtViewModel: ObservableObject {
    @Published var allDebts: [Debt] = []
    @Published var summary: DebtSummary?
    @Published var isLoading = false
    @Published var error: String?

    @Published var selectedTab: DebtTab = .all

    enum DebtTab: String, CaseIterable, Identifiable {
        case all = "All"
        case borrowed = "Borrowed"
        case lent = "Lent"
        case overdue = "Overdue"
        var id: String { rawValue }
    }

    private let client = APIClient.shared

    var displayedDebts: [Debt] {
        switch selectedTab {
        case .all: return allDebts
        case .borrowed: return allDebts.filter { $0.type == .borrowed }
        case .lent: return allDebts.filter { $0.type == .lent }
        case .overdue: return allDebts.filter { $0.isOverdue }
        }
    }

    func load() async {
        isLoading = true
        error = nil
        do {
            async let debtsReq: [Debt] = client.get("/api/debt")
            async let summaryReq: DebtSummary = client.get("/api/debt/summary")
            let (debts, sum) = try await (debtsReq, summaryReq)
            allDebts = debts
            summary = sum
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func delete(id: String) async {
        do {
            try await client.delete("/api/debt/\(id)")
            allDebts.removeAll { $0.id == id }
        } catch {
            self.error = error.localizedDescription
        }
    }

    func loadPayments(debtId: String) async -> [DebtPayment] {
        do {
            return try await client.get("/api/debt/\(debtId)/payments")
        } catch {
            return []
        }
    }
}
