import SwiftUI

struct SavingsDetailView: View {
    let account: SavingsAccount
    let onChanged: () -> Void

    @StateObject private var vm: SavingsDetailViewModel
    @State private var showActionSheet = false
    @State private var showCloseConfirm = false
    @Environment(\.dismiss) private var dismiss

    init(account: SavingsAccount, onChanged: @escaping () -> Void) {
        self.account = account
        self.onChanged = onChanged
        _vm = StateObject(wrappedValue: SavingsDetailViewModel(account: account))
    }

    var body: some View {
        List {
            Section("Account Info") {
                LabeledContent("Type", value: account.typeName)
                LabeledContent("Status", value: account.statusName)
                LabeledContent("Deposited", value: account.totalDeposited.currency)
                LabeledContent("Current Value", value: account.currentValue.currency)
                LabeledContent("Profit/Loss", value: account.profitLoss.currency)
                if let rate = account.interestRate {
                    LabeledContent("Interest Rate", value: String(format: "%.2f%%", rate))
                }
                LabeledContent("Start Date", value: account.startDate.displayDate)
                if let mat = account.maturityDate?.displayDate {
                    LabeledContent("Maturity Date", value: mat)
                }
                if let note = account.note, !note.isEmpty {
                    LabeledContent("Note", value: note)
                }
            }

            Section("Transaction History") {
                if vm.isLoading {
                    ProgressView()
                } else if vm.history.isEmpty {
                    Text("No history").foregroundStyle(.secondary).font(.subheadline)
                } else {
                    ForEach(vm.history) { item in
                        HistoryRowView(item: item)
                    }
                }
            }

            if account.status != .closed {
                Section("Actions") {
                    Button("Deposit / Withdraw / Update...") { showActionSheet = true }
                        .foregroundStyle(.blue)
                    Divider()
                    Button("Close Account", role: .destructive) { showCloseConfirm = true }
                }
            }

            if let error = vm.error {
                Section { Text(error).foregroundStyle(.red).font(.footnote) }
            }
        }
        .navigationTitle(account.name)
        .navigationBarTitleDisplayMode(.large)
        .sheet(isPresented: $showActionSheet) {
            NavigationStack {
                SavingsActionView(account: account) {
                    Task {
                        await vm.loadHistory()
                        onChanged()
                    }
                }
            }
        }
        .confirmationDialog("Close \"\(account.name)\"?", isPresented: $showCloseConfirm, titleVisibility: .visible) {
            Button("Close Account", role: .destructive) {
                Task {
                    await vm.closeAccount()
                    onChanged()
                    dismiss()
                }
            }
            Button("Cancel", role: .cancel) {}
        }
        .task { await vm.loadHistory() }
    }
}

// MARK: - History Row

private struct HistoryRowView: View {
    let item: SavingsHistory

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(item.transactionTypeName)
                    .font(.subheadline.weight(.medium))
                Text(item.date.displayDate).font(.caption).foregroundStyle(.secondary)
                if let note = item.note, !note.isEmpty {
                    Text(note).font(.caption2).foregroundStyle(.tertiary)
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text(item.amount.currency).font(.subheadline.bold())
                Text(item.newValue.currency).font(.caption).foregroundStyle(.secondary)
            }
        }
    }
}

// MARK: - Detail ViewModel

@MainActor
final class SavingsDetailViewModel: ObservableObject {
    @Published var history: [SavingsHistory] = []
    @Published var isLoading = false
    @Published var error: String?

    private let account: SavingsAccount
    private let client = APIClient.shared

    init(account: SavingsAccount) { self.account = account }

    func loadHistory() async {
        isLoading = true
        do {
            history = try await client.get("/api/savings/\(account.id)/history")
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func closeAccount() async {
        do {
            let body = CloseAccountRequest(note: nil)
            let _: SavingsAccount = try await client.post("/api/savings/\(account.id)/close", body: body)
        } catch {
            self.error = error.localizedDescription
        }
    }
}
