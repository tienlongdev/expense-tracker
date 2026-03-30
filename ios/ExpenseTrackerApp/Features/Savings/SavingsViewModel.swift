import Foundation

@MainActor
final class SavingsViewModel: ObservableObject {
    @Published var accounts: [SavingsAccount] = []
    @Published var summary: SavingsSummary?
    @Published var isLoading = false
    @Published var error: String?

    @Published var selectedTab: SavingsTab = .all

    enum SavingsTab: String, CaseIterable, Identifiable {
        case all = "All"
        case active = "Active"
        case closed = "Closed"
        var id: String { rawValue }
    }

    private let client = APIClient.shared

    var displayedAccounts: [SavingsAccount] {
        switch selectedTab {
        case .all: return accounts
        case .active: return accounts.filter { $0.status == .active || $0.status == .matured }
        case .closed: return accounts.filter { $0.status == .closed }
        }
    }

    func load() async {
        isLoading = true
        error = nil
        do {
            async let accountsReq: [SavingsAccount] = client.get("/api/savings")
            async let summaryReq: SavingsSummary = client.get("/api/savings/summary")
            let (accts, sum) = try await (accountsReq, summaryReq)
            accounts = accts
            summary = sum
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func delete(id: String) async {
        do {
            try await client.delete("/api/savings/\(id)")
            accounts.removeAll { $0.id == id }
        } catch {
            self.error = error.localizedDescription
        }
    }

    func closeAccount(id: String, note: String?) async {
        do {
            let body = CloseAccountRequest(note: note)
            let updated: SavingsAccount = try await client.post("/api/savings/\(id)/close", body: body)
            if let idx = accounts.firstIndex(where: { $0.id == id }) {
                accounts[idx] = updated
            }
        } catch {
            self.error = error.localizedDescription
        }
    }
}
