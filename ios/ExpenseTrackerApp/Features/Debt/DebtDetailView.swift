import SwiftUI

struct DebtDetailView: View {
    let debt: Debt
    let onChanged: () -> Void

    @StateObject private var vm: DebtDetailViewModel
    @State private var showPaymentForm = false
    @Environment(\.dismiss) private var dismiss

    init(debt: Debt, onChanged: @escaping () -> Void) {
        self.debt = debt
        self.onChanged = onChanged
        _vm = StateObject(wrappedValue: DebtDetailViewModel(debt: debt))
    }

    var body: some View {
        List {
            // Meta section
            Section("Details") {
                LabeledContent("Person", value: debt.personName)
                LabeledContent("Type", value: debt.typeName)
                LabeledContent("Status", value: debt.statusName)
                LabeledContent("Original", value: debt.originalAmount.currency)
                LabeledContent("Remaining", value: debt.remainingAmount.currency)
                LabeledContent("Paid", value: debt.paidAmount.currency)
                if let due = debt.dueDate?.displayDate {
                    LabeledContent("Due Date") {
                        Text(due)
                            .foregroundStyle(debt.isOverdue ? .orange : .primary)
                    }
                }
                if let note = debt.note, !note.isEmpty {
                    LabeledContent("Note", value: note)
                }
                LabeledContent("Created", value: debt.createdAt.displayDate)
            }

            // Progress bar
            Section {
                let pct = debt.originalAmount > 0
                    ? (debt.paidAmount / debt.originalAmount) * 100
                    : 0
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("Repayment progress").font(.subheadline)
                        Spacer()
                        Text("\(Int(pct))%").font(.subheadline.bold())
                    }
                    BudgetProgressBar(
                        percent: pct,
                        isOverBudget: false,
                        isNearLimit: pct > 70
                    )
                }
            }

            // Payment history
            Section("Payment History") {
                if vm.isLoading {
                    ProgressView()
                } else if vm.payments.isEmpty {
                    Text("No payments recorded")
                        .foregroundStyle(.secondary)
                        .font(.subheadline)
                } else {
                    ForEach(vm.payments) { p in
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(p.paidDate.displayDate).font(.subheadline)
                                if let note = p.note, !note.isEmpty {
                                    Text(note).font(.caption).foregroundStyle(.secondary)
                                }
                            }
                            Spacer()
                            Text(p.amount.currency)
                                .font(.subheadline.bold())
                                .foregroundStyle(.green)
                        }
                    }
                }
            }

            if debt.status != .paid {
                Section {
                    Button("Add Payment") { showPaymentForm = true }
                        .frame(maxWidth: .infinity, alignment: .center)
                        .foregroundStyle(.blue)
                }
            }

            if let error = vm.error {
                Section {
                    Text(error).foregroundStyle(.red).font(.footnote)
                }
            }
        }
        .navigationTitle(debt.title)
        .navigationBarTitleDisplayMode(.large)
        .sheet(isPresented: $showPaymentForm) {
            NavigationStack {
                DebtPaymentFormView(debtId: debt.id, maxAmount: debt.remainingAmount) {
                    Task {
                        await vm.loadPayments()
                        onChanged()
                    }
                }
            }
        }
        .task { await vm.loadPayments() }
    }
}

// MARK: - Detail ViewModel

@MainActor
final class DebtDetailViewModel: ObservableObject {
    @Published var payments: [DebtPayment] = []
    @Published var isLoading = false
    @Published var error: String?

    private let debt: Debt
    private let client = APIClient.shared

    init(debt: Debt) { self.debt = debt }

    func loadPayments() async {
        isLoading = true
        do {
            payments = try await client.get("/api/debt/\(debt.id)/payments")
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}
