import Foundation

@MainActor
final class TransactionFormViewModel: ObservableObject {
    @Published var title: String = ""
    @Published var amount: String = ""
    @Published var selectedType: TransactionType = .expense
    @Published var selectedCategoryId: String = ""
    @Published var date: Date = Date()
    @Published var note: String = ""

    @Published var categories: [Category] = []
    @Published var isLoading = false
    @Published var isSaving = false
    @Published var error: String?

    let isEditing: Bool
    private let transaction: Transaction?
    private let onSave: () -> Void
    private let client = APIClient.shared

    init(transaction: Transaction?, onSave: @escaping () -> Void) {
        self.transaction = transaction
        self.onSave = onSave
        self.isEditing = transaction != nil

        if let tx = transaction {
            self.title = tx.title
            self.amount = tx.amount == 0 ? "" : "\(Int(tx.amount))"
            self.selectedType = tx.type
            self.selectedCategoryId = tx.categoryId
            self.date = tx.date.asDate ?? Date()
            self.note = tx.note ?? ""
        }
    }

    var filteredCategories: [Category] {
        categories.filter { $0.type == selectedType }
    }

    var canSave: Bool {
        !title.trimmingCharacters(in: .whitespaces).isEmpty
        && (Double(amount) ?? 0) > 0
        && !selectedCategoryId.isEmpty
    }

    // MARK: - Load categories

    func loadCategories() async {
        isLoading = true
        do {
            let all: [Category] = try await client.get("/api/category")
            categories = all
            // Auto-select first matching category if none selected
            if selectedCategoryId.isEmpty, let first = filteredCategories.first {
                selectedCategoryId = first.id
            }
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    // MARK: - Save

    func save() async -> Bool {
        guard canSave else { return false }
        guard let amountValue = Double(amount) else { return false }

        isSaving = true
        error = nil
        let dateStr = date.apiDateString
        do {
            if let tx = transaction {
                let body = UpdateTransactionRequest(
                    title: title.trimmingCharacters(in: .whitespaces),
                    amount: amountValue,
                    type: selectedType.rawValue,
                    categoryId: selectedCategoryId,
                    date: dateStr,
                    note: note.isEmpty ? nil : note
                )
                let _: Transaction = try await client.put("/api/transaction/\(tx.id)", body: body)
            } else {
                let body = CreateTransactionRequest(
                    title: title.trimmingCharacters(in: .whitespaces),
                    amount: amountValue,
                    type: selectedType.rawValue,
                    categoryId: selectedCategoryId,
                    date: dateStr,
                    note: note.isEmpty ? nil : note
                )
                let _: Transaction = try await client.post("/api/transaction", body: body)
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
