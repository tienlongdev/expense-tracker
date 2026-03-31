import SwiftUI

struct DebtPaymentFormView: View {
    @StateObject private var vm: DebtPaymentFormViewModel
    @Environment(\.dismiss) private var dismiss

    init(debtId: String, maxAmount: Double, onSave: @escaping () -> Void) {
        _vm = StateObject(wrappedValue: DebtPaymentFormViewModel(
            debtId: debtId,
            maxAmount: maxAmount,
            onSave: onSave
        ))
    }

    var body: some View {
        Form {
            Section("Payment Details") {
                HStack {
                    TextField("Amount", text: $vm.amount)
                        .keyboardType(.decimalPad)
                        .onChange(of: vm.amount) { _, newValue in
                            let formatted = newValue.formattedAmount
                            if vm.amount != formatted {
                                vm.amount = formatted
                            }
                        }
                    Text("₫").foregroundStyle(.secondary)
                }
                Text("Max: \(vm.maxAmount.currency)")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                DatePicker("Payment Date", selection: $vm.paidDate, displayedComponents: .date)
            }

            Section("Note (optional)") {
                TextField("Note...", text: $vm.note, axis: .vertical)
                    .lineLimit(3, reservesSpace: true)
            }

            if let error = vm.error {
                Section { Text(error).foregroundStyle(.red).font(.footnote) }
            }
        }
        .navigationTitle("Add Payment")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) { Button("Cancel") { dismiss() } }
            ToolbarItem(placement: .topBarTrailing) {
                if vm.isSaving { ProgressView() }
                else {
                    Button("Save") {
                        Task { if await vm.save() { dismiss() } }
                    }
                    .fontWeight(.semibold)
                    .disabled(!vm.canSave)
                }
            }
        }
    }
}

// MARK: - ViewModel

@MainActor
final class DebtPaymentFormViewModel: ObservableObject {
    @Published var amount: String = ""
    @Published var paidDate: Date = Date()
    @Published var note: String = ""
    @Published var isSaving = false
    @Published var error: String?

    let maxAmount: Double
    private let debtId: String
    private let onSave: () -> Void
    private let client = APIClient.shared

    init(debtId: String, maxAmount: Double, onSave: @escaping () -> Void) {
        self.debtId = debtId
        self.maxAmount = maxAmount
        self.onSave = onSave
    }

    var canSave: Bool {
        let v = amount.rawAmount
        return v > 0 && v <= maxAmount
    }

    func save() async -> Bool {
        let v = amount.rawAmount
        guard v > 0 else {
            error = "Please enter a valid amount."
            return false
        }
        guard v <= maxAmount else {
            error = "Payment cannot exceed remaining amount (\(maxAmount.currency))."
            return false
        }
        isSaving = true
        error = nil
        do {
            let body = CreateDebtPaymentRequest(
                amount: v,
                paidDate: paidDate.apiDateString,
                note: note.isEmpty ? nil : note
            )
            let _: DebtPayment = try await client.post("/api/debt/\(debtId)/payments", body: body)
            onSave()
            isSaving = false
            return true
        } catch {
            self.error = error.localizedDescription
            isSaving = false
            return false
        }
    }
}

#Preview {
    NavigationStack {
        DebtPaymentFormView(debtId: "test", maxAmount: 1_000_000, onSave: {})
    }
}
