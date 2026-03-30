import SwiftUI

struct BudgetFormView: View {
    @StateObject private var formVM: BudgetFormViewModel
    @Environment(\.dismiss) private var dismiss

    init(budgetRecord: BudgetRecord?, year: Int, month: Int, onSave: @escaping () -> Void) {
        _formVM = StateObject(wrappedValue: BudgetFormViewModel(
            budgetRecord: budgetRecord,
            year: year,
            month: month,
            onSave: onSave
        ))
    }

    var body: some View {
        Form {
            Section("Category (Expense only)") {
                if formVM.isLoadingCategories {
                    ProgressView()
                } else {
                    Picker("Category", selection: $formVM.selectedCategoryId) {
                        ForEach(formVM.expenseCategories) { cat in
                            HStack {
                                if let icon = cat.icon { Text(icon) }
                                Text(cat.name)
                            }
                            .tag(cat.id)
                        }
                    }
                }
            }

            Section("Amount") {
                HStack {
                    TextField("Planned amount", text: $formVM.plannedAmount)
                        .keyboardType(.decimalPad)
                    Text("₫").foregroundStyle(.secondary)
                }
            }

            Section("Note (optional)") {
                TextField("Note...", text: $formVM.note, axis: .vertical)
                    .lineLimit(3, reservesSpace: true)
            }

            if let error = formVM.error {
                Section {
                    Text(error).foregroundStyle(.red).font(.footnote)
                }
            }
        }
        .navigationTitle(formVM.isEditing ? "Edit Budget" : "New Budget")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) { Button("Cancel") { dismiss() } }
            ToolbarItem(placement: .topBarTrailing) {
                if formVM.isSaving { ProgressView() }
                else {
                    Button("Save") {
                        Task {
                            if await formVM.save() { dismiss() }
                        }
                    }
                    .fontWeight(.semibold)
                    .disabled(!formVM.canSave)
                }
            }
        }
        .task { await formVM.loadCategories() }
    }
}

// MARK: - ViewModel

@MainActor
final class BudgetFormViewModel: ObservableObject {
    @Published var selectedCategoryId: String = ""
    @Published var plannedAmount: String = ""
    @Published var note: String = ""
    @Published var expenseCategories: [Category] = []
    @Published var isLoadingCategories = false
    @Published var isSaving = false
    @Published var error: String?

    let isEditing: Bool
    private let budgetRecord: BudgetRecord?
    private let year: Int
    private let month: Int
    private let onSave: () -> Void
    private let client = APIClient.shared

    init(budgetRecord: BudgetRecord?, year: Int, month: Int, onSave: @escaping () -> Void) {
        self.budgetRecord = budgetRecord
        self.year = year
        self.month = month
        self.onSave = onSave
        self.isEditing = budgetRecord != nil

        if let r = budgetRecord {
            self.selectedCategoryId = r.categoryId
            self.plannedAmount = r.plannedAmount == 0 ? "" : "\(Int(r.plannedAmount))"
            self.note = r.note ?? ""
        }
    }

    var canSave: Bool {
        !selectedCategoryId.isEmpty && (Double(plannedAmount) ?? 0) > 0
    }

    func loadCategories() async {
        isLoadingCategories = true
        do {
            let cats: [Category] = try await client.get("/api/category/type/2") // expense = 2
            expenseCategories = cats
            if selectedCategoryId.isEmpty {
                selectedCategoryId = cats.first?.id ?? ""
            }
        } catch {
            self.error = error.localizedDescription
        }
        isLoadingCategories = false
    }

    func save() async -> Bool {
        guard let amount = Double(plannedAmount), amount > 0 else { return false }
        isSaving = true
        error = nil
        do {
            if let record = budgetRecord {
                let body = UpdateBudgetRequest(plannedAmount: amount, note: note.isEmpty ? nil : note)
                let _: BudgetRecord = try await client.put("/api/budget/\(record.id)", body: body)
            } else {
                let body = CreateBudgetRequest(
                    categoryId: selectedCategoryId,
                    year: year,
                    month: month,
                    plannedAmount: amount,
                    note: note.isEmpty ? nil : note
                )
                let _: BudgetRecord = try await client.post("/api/budget", body: body)
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
    NavigationStack {
        BudgetFormView(budgetRecord: nil, year: 2024, month: 3, onSave: {})
    }
}
