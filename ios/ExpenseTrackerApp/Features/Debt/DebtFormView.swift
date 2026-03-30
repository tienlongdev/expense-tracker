import SwiftUI

struct DebtFormView: View {
    @StateObject private var vm: DebtFormViewModel
    @Environment(\.dismiss) private var dismiss

    init(debt: Debt?, onSave: @escaping () -> Void) {
        _vm = StateObject(wrappedValue: DebtFormViewModel(debt: debt, onSave: onSave))
    }

    var body: some View {
        Form {
            Section("Info") {
                TextField("Title", text: $vm.title).autocorrectionDisabled()
                TextField("Person / Lender / Borrower", text: $vm.personName).autocorrectionDisabled()
            }

            if !vm.isEditing {
                Section("Amount & Type") {
                    HStack {
                        TextField("Amount", text: $vm.amount)
                            .keyboardType(.decimalPad)
                        Text("₫").foregroundStyle(.secondary)
                    }
                    Picker("Type", selection: $vm.selectedType) {
                        ForEach(DebtType.allCases, id: \.self) { t in
                            Text(t.displayName).tag(t)
                        }
                    }
                    .pickerStyle(.segmented)
                }
            }

            Section("Due Date (optional)") {
                Toggle("Has due date", isOn: $vm.hasDueDate)
                if vm.hasDueDate {
                    DatePicker("Due Date", selection: $vm.dueDate, displayedComponents: .date)
                }
            }

            Section("Note (optional)") {
                TextField("Note...", text: $vm.note, axis: .vertical)
                    .lineLimit(3, reservesSpace: true)
            }

            if let error = vm.error {
                Section { Text(error).foregroundStyle(.red).font(.footnote) }
            }
        }
        .navigationTitle(vm.isEditing ? "Edit Debt" : "New Debt")
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
final class DebtFormViewModel: ObservableObject {
    @Published var title: String = ""
    @Published var personName: String = ""
    @Published var amount: String = ""
    @Published var selectedType: DebtType = .borrowed
    @Published var hasDueDate: Bool = false
    @Published var dueDate: Date = Date()
    @Published var note: String = ""
    @Published var isSaving = false
    @Published var error: String?

    let isEditing: Bool
    private let debt: Debt?
    private let onSave: () -> Void
    private let client = APIClient.shared

    init(debt: Debt?, onSave: @escaping () -> Void) {
        self.debt = debt
        self.onSave = onSave
        self.isEditing = debt != nil

        if let d = debt {
            self.title = d.title
            self.personName = d.personName
            self.selectedType = d.type
            self.note = d.note ?? ""
            if let due = d.dueDate?.asDate {
                self.hasDueDate = true
                self.dueDate = due
            }
        }
    }

    var canSave: Bool {
        !title.trimmingCharacters(in: .whitespaces).isEmpty
        && !personName.trimmingCharacters(in: .whitespaces).isEmpty
        && (isEditing || (Double(amount) ?? 0) > 0)
    }

    func save() async -> Bool {
        isSaving = true
        error = nil
        let dueDateStr: String? = hasDueDate ? dueDate.apiDateString : nil
        do {
            if let d = debt {
                let body = UpdateDebtRequest(
                    title: title.trimmingCharacters(in: .whitespaces),
                    personName: personName.trimmingCharacters(in: .whitespaces),
                    dueDate: dueDateStr,
                    note: note.isEmpty ? nil : note
                )
                let _: Debt = try await client.put("/api/debt/\(d.id)", body: body)
            } else {
                guard let amt = Double(amount), amt > 0 else {
                    error = "Please enter a valid amount."
                    isSaving = false
                    return false
                }
                let body = CreateDebtRequest(
                    title: title.trimmingCharacters(in: .whitespaces),
                    personName: personName.trimmingCharacters(in: .whitespaces),
                    originalAmount: amt,
                    type: selectedType.rawValue,
                    dueDate: dueDateStr,
                    note: note.isEmpty ? nil : note
                )
                let _: Debt = try await client.post("/api/debt", body: body)
            }
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
    NavigationStack { DebtFormView(debt: nil, onSave: {}) }
}
