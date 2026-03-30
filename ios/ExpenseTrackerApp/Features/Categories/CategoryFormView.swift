import SwiftUI

struct CategoryFormView: View {
    @StateObject private var vm: CategoryFormViewModel
    @Environment(\.dismiss) private var dismiss

    init(category: Category?, onSave: @escaping () -> Void) {
        _vm = StateObject(wrappedValue: CategoryFormViewModel(category: category, onSave: onSave))
    }

    var body: some View {
        Form {
            Section("Details") {
                TextField("Category name", text: $vm.name).autocorrectionDisabled()
                Picker("Type", selection: $vm.selectedType) {
                    ForEach(TransactionType.allCases, id: \.self) { t in
                        Text(t.displayName).tag(t)
                    }
                }
                .pickerStyle(.segmented)
            }

            if let error = vm.error {
                Section { Text(error).foregroundStyle(.red).font(.footnote) }
            }
        }
        .navigationTitle(vm.isEditing ? "Edit Category" : "New Category")
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
final class CategoryFormViewModel: ObservableObject {
    @Published var name: String = ""
    @Published var selectedType: TransactionType = .expense
    @Published var isSaving = false
    @Published var error: String?

    let isEditing: Bool
    private let category: Category?
    private let onSave: () -> Void
    private let client = APIClient.shared

    init(category: Category?, onSave: @escaping () -> Void) {
        self.category = category
        self.isEditing = category != nil
        self.onSave = onSave

        if let c = category {
            self.name = c.name
            self.selectedType = c.type
        }
    }

    var canSave: Bool { !name.trimmingCharacters(in: .whitespaces).isEmpty }

    func save() async -> Bool {
        isSaving = true; error = nil
        do {
            if let c = category {
                let body = UpdateCategoryRequest(name: name.trimmingCharacters(in: .whitespaces), type: selectedType.rawValue)
                let _: Category = try await client.put("/api/category/\(c.id)", body: body)
            } else {
                let body = CreateCategoryRequest(name: name.trimmingCharacters(in: .whitespaces), type: selectedType.rawValue)
                let _: Category = try await client.post("/api/category", body: body)
            }
            onSave(); isSaving = false; return true
        } catch {
            self.error = error.localizedDescription; isSaving = false; return false
        }
    }
}

#Preview {
    NavigationStack { CategoryFormView(category: nil, onSave: {}) }
}
