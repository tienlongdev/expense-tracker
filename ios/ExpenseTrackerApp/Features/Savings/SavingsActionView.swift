import SwiftUI

// Handles: Deposit, Withdraw, Update Value, Add Interest

struct SavingsActionView: View {
    let account: SavingsAccount
    let onSave: () -> Void
    @StateObject private var vm: SavingsActionViewModel
    @Environment(\.dismiss) private var dismiss

    init(account: SavingsAccount, onSave: @escaping () -> Void) {
        self.account = account
        self.onSave = onSave
        _vm = StateObject(wrappedValue: SavingsActionViewModel(account: account, onSave: onSave))
    }

    var body: some View {
        Form {
            Section("Action") {
                Picker("Action", selection: $vm.selectedAction) {
                    ForEach(SavingsAction.allCases, id: \.self) { a in
                        Text(a.displayName).tag(a)
                    }
                }
                .pickerStyle(.segmented)
            }

            Section {
                Text(vm.selectedAction.description)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                Text("Current value: \(account.currentValue.currency)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Section("Amount") {
                HStack {
                    TextField(vm.selectedAction == .updateValue ? "New Value" : "Amount", text: $vm.amount)
                        .keyboardType(.decimalPad)
                        .onChange(of: vm.amount) { _, newValue in
                            let formatted = newValue.formattedAmount
                            if vm.amount != formatted {
                                vm.amount = formatted
                            }
                        }
                    Text("₫").foregroundStyle(.secondary)
                }
                DatePicker("Date", selection: $vm.date, displayedComponents: .date)
            }

            Section("Note (optional)") {
                TextField("Note...", text: $vm.note, axis: .vertical).lineLimit(3, reservesSpace: true)
            }

            if let error = vm.error {
                Section { Text(error).foregroundStyle(.red).font(.footnote) }
            }
        }
        .navigationTitle(vm.selectedAction.displayName)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) { Button("Cancel") { dismiss() } }
            ToolbarItem(placement: .topBarTrailing) {
                if vm.isSaving { ProgressView() }
                else {
                    Button("Apply") { Task { if await vm.apply() { dismiss() } } }
                        .fontWeight(.semibold).disabled(!vm.canApply)
                }
            }
        }
    }
}

// MARK: - Action Enum

enum SavingsAction: CaseIterable {
    case deposit, withdraw, updateValue, interest

    var displayName: String {
        switch self {
        case .deposit: return "Deposit"
        case .withdraw: return "Withdraw"
        case .updateValue: return "Update Value"
        case .interest: return "Add Interest"
        }
    }

    var description: String {
        switch self {
        case .deposit: return "Add funds to the account."
        case .withdraw: return "Withdraw funds. Cannot exceed current value."
        case .updateValue: return "Set a new current value (e.g. mark-to-market)."
        case .interest: return "Record an interest earned event."
        }
    }
}

// MARK: - ViewModel

@MainActor
final class SavingsActionViewModel: ObservableObject {
    @Published var selectedAction: SavingsAction = .deposit
    @Published var amount: String = ""
    @Published var date: Date = Date()
    @Published var note: String = ""
    @Published var isSaving = false
    @Published var error: String?

    private let account: SavingsAccount
    private let onSave: () -> Void
    private let client = APIClient.shared

    init(account: SavingsAccount, onSave: @escaping () -> Void) {
        self.account = account
        self.onSave = onSave
    }

    var canApply: Bool { amount.rawAmount > 0 }

    func apply() async -> Bool {
        let v = amount.rawAmount
        guard v > 0 else {
            error = "Please enter a valid amount."
            return false
        }
        isSaving = true; error = nil
        let dateStr = date.apiDateString
        let noteVal: String? = note.isEmpty ? nil : note
        let id = account.id

        do {
            switch selectedAction {
            case .deposit:
                let body = SavingsDepositRequest(amount: v, date: dateStr, note: noteVal)
                let _: SavingsHistory = try await client.post("/api/savings/\(id)/deposit", body: body)
            case .withdraw:
                if v > account.currentValue {
                    error = "Cannot withdraw more than current value (\(account.currentValue.currency))."
                    isSaving = false; return false
                }
                let body = SavingsWithdrawRequest(amount: v, date: dateStr, note: noteVal)
                let _: SavingsHistory = try await client.post("/api/savings/\(id)/withdraw", body: body)
            case .updateValue:
                let body = UpdateSavingsValueRequest(newValue: v, date: dateStr, note: noteVal)
                let _: SavingsHistory = try await client.post("/api/savings/\(id)/update-value", body: body)
            case .interest:
                let body = SavingsInterestRequest(amount: v, date: dateStr, note: noteVal)
                let _: SavingsHistory = try await client.post("/api/savings/\(id)/interest", body: body)
            }
            onSave(); isSaving = false; return true
        } catch {
            self.error = error.localizedDescription; isSaving = false; return false
        }
    }
}

#Preview {
    let acct = SavingsAccount(
        id: "1", name: "Emergency Fund", type: .savings, typeName: "Savings",
        status: .active, statusName: "Active", totalDeposited: 10_000_000,
        currentValue: 10_500_000, profitLoss: 500_000, interestRate: 5.0,
        startDate: "2024-01-01", maturityDate: nil, note: nil, createdAt: "2024-01-01T00:00:00"
    )
    NavigationStack { SavingsActionView(account: acct, onSave: {}) }
}
