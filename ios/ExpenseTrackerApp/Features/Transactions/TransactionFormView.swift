import SwiftUI

struct TransactionFormView: View {
    @StateObject private var viewModel: TransactionFormViewModel
    @Environment(\.dismiss) private var dismiss

    init(transaction: Transaction?, onSave: @escaping () -> Void) {
        _viewModel = StateObject(wrappedValue: TransactionFormViewModel(
            transaction: transaction,
            onSave: onSave
        ))
    }

    var body: some View {
        Form {
            typeSection
            detailsSection
            categorySection
            noteSection

            if let error = viewModel.error {
                Section {
                    Text(error)
                        .foregroundStyle(.red)
                        .font(.footnote)
                }
            }
        }
        .navigationTitle(viewModel.isEditing ? "Edit Transaction" : "New Transaction")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar { toolbarContent }
        .task { await viewModel.loadCategories() }
        .onChange(of: viewModel.selectedType) { _, _ in
            // Reset category selection when type changes
            viewModel.selectedCategoryId = viewModel.filteredCategories.first?.id ?? ""
        }
    }

    // MARK: - Sections

    private var typeSection: some View {
        Section {
            Picker("Type", selection: $viewModel.selectedType) {
                ForEach(TransactionType.allCases, id: \.self) { t in
                    Text(t.displayName).tag(t)
                }
            }
            .pickerStyle(.segmented)
        }
    }

    private var detailsSection: some View {
        Section("Details") {
            TextField("Title", text: $viewModel.title)
                .autocorrectionDisabled()

            HStack {
                Text("Amount")
                Spacer()
                TextField("0", text: $viewModel.amount)
                    .keyboardType(.decimalPad)
                    .multilineTextAlignment(.trailing)
                    .frame(maxWidth: 160)
                Text("₫")
                    .foregroundStyle(.secondary)
            }

            DatePicker("Date", selection: $viewModel.date, displayedComponents: .date)
        }
    }

    private var categorySection: some View {
        Section("Category") {
            if viewModel.isLoading {
                ProgressView()
            } else if viewModel.filteredCategories.isEmpty {
                Text("No categories available for this type")
                    .foregroundStyle(.secondary)
                    .font(.subheadline)
            } else {
                Picker("Category", selection: $viewModel.selectedCategoryId) {
                    ForEach(viewModel.filteredCategories) { cat in
                        HStack {
                            if let icon = cat.icon { Text(icon) }
                            Text(cat.name)
                        }
                        .tag(cat.id)
                    }
                }
            }
        }
    }

    private var noteSection: some View {
        Section("Note (optional)") {
            TextField("Add a note...", text: $viewModel.note, axis: .vertical)
                .lineLimit(3, reservesSpace: true)
        }
    }

    // MARK: - Toolbar

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button("Cancel") { dismiss() }
        }
        ToolbarItem(placement: .topBarTrailing) {
            if viewModel.isSaving {
                ProgressView()
            } else {
                Button("Save") {
                    Task {
                        let saved = await viewModel.save()
                        if saved { dismiss() }
                    }
                }
                .fontWeight(.semibold)
                .disabled(!viewModel.canSave)
            }
        }
    }
}

#Preview {
    NavigationStack {
        TransactionFormView(transaction: nil, onSave: {})
    }
}
