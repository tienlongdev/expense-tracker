import SwiftUI

struct SavingsAccountFormView: View {
    @StateObject private var vm: SavingsAccountFormViewModel
    @Environment(\.dismiss) private var dismiss

    init(account: SavingsAccount?, onSave: @escaping () -> Void) {
        _vm = StateObject(wrappedValue: SavingsAccountFormViewModel(account: account, onSave: onSave))
    }

    var body: some View {
        Form {
            Section("Account Details") {
                TextField("Account name", text: $vm.name).autocorrectionDisabled()
                Picker("Type", selection: $vm.selectedType) {
                    ForEach(SavingsType.allCases, id: \.self) { t in
                        Label(t.displayName, systemImage: t.sfSymbol).tag(t)
                    }
                }
            }

            if !vm.isEditing {
                Section("Initial Amount") {
                    HStack {
                        TextField("Amount", text: $vm.initialAmount)
                            .keyboardType(.decimalPad)
                        Text("₫").foregroundStyle(.secondary)
                    }
                }
            }

            Section("Interest & Maturity (optional)") {
                HStack {
                    Text("Interest Rate")
                    Spacer()
                    TextField("0.00", text: $vm.interestRate)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                        .frame(maxWidth: 80)
                    Text("%").foregroundStyle(.secondary)
                }

                DatePicker("Start Date", selection: $vm.startDate, displayedComponents: .date)

                Toggle("Has maturity date", isOn: $vm.hasMaturityDate)
                if vm.hasMaturityDate {
                    DatePicker("Maturity Date", selection: $vm.maturityDate, in: vm.startDate..., displayedComponents: .date)
                }
            }

            Section("Note (optional)") {
                TextField("Note...", text: $vm.note, axis: .vertical).lineLimit(3, reservesSpace: true)
            }

            if let error = vm.error {
                Section { Text(error).foregroundStyle(.red).font(.footnote) }
            }
        }
        .navigationTitle(vm.isEditing ? "Edit Account" : "New Account")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) { Button("Cancel") { dismiss() } }
            ToolbarItem(placement: .topBarTrailing) {
                if vm.isSaving { ProgressView() }
                else {
                    Button("Save") { Task { if await vm.save() { dismiss() } } }
                        .fontWeight(.semibold).disabled(!vm.canSave)
                }
            }
        }
    }
}

// MARK: - ViewModel

@MainActor
final class SavingsAccountFormViewModel: ObservableObject {
    @Published var name: String = ""
    @Published var selectedType: SavingsType = .savings
    @Published var initialAmount: String = ""
    @Published var interestRate: String = ""
    @Published var startDate: Date = Date()
    @Published var hasMaturityDate: Bool = false
    @Published var maturityDate: Date = Calendar.current.date(byAdding: .year, value: 1, to: Date()) ?? Date()
    @Published var note: String = ""
    @Published var isSaving = false
    @Published var error: String?

    let isEditing: Bool
    private let account: SavingsAccount?
    private let onSave: () -> Void
    private let client = APIClient.shared

    init(account: SavingsAccount?, onSave: @escaping () -> Void) {
        self.account = account
        self.isEditing = account != nil
        self.onSave = onSave

        if let a = account {
            self.name = a.name
            self.selectedType = a.type
            self.note = a.note ?? ""
            self.startDate = a.startDate.asDate ?? Date()
            if let r = a.interestRate { self.interestRate = String(format: "%.2f", r) }
            if let mat = a.maturityDate?.asDate {
                self.hasMaturityDate = true
                self.maturityDate = mat
            }
        }
    }

    var canSave: Bool {
        !name.trimmingCharacters(in: .whitespaces).isEmpty
        && (isEditing || (Double(initialAmount) ?? 0) > 0)
    }

    func save() async -> Bool {
        isSaving = true; error = nil
        let matStr: String? = hasMaturityDate ? maturityDate.apiDateString : nil
        let rateVal: Double? = interestRate.isEmpty ? nil : Double(interestRate)
        do {
            if let a = account {
                let body = UpdateSavingsAccountRequest(
                    name: name.trimmingCharacters(in: .whitespaces),
                    type: selectedType.rawValue,
                    interestRate: rateVal,
                    maturityDate: matStr,
                    note: note.isEmpty ? nil : note
                )
                let _: SavingsAccount = try await client.put("/api/savings/\(a.id)", body: body)
            } else {
                guard let amt = Double(initialAmount), amt > 0 else {
                    error = "Please enter a valid initial amount."
                    isSaving = false; return false
                }
                let body = CreateSavingsAccountRequest(
                    name: name.trimmingCharacters(in: .whitespaces),
                    type: selectedType.rawValue,
                    initialAmount: amt,
                    interestRate: rateVal,
                    startDate: startDate.apiDateString,
                    maturityDate: matStr,
                    note: note.isEmpty ? nil : note
                )
                let _: SavingsAccount = try await client.post("/api/savings", body: body)
            }
            onSave(); isSaving = false; return true
        } catch {
            self.error = error.localizedDescription; isSaving = false; return false
        }
    }
}

#Preview {
    NavigationStack { SavingsAccountFormView(account: nil, onSave: {}) }
}
