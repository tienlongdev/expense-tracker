import SwiftUI

struct CategoriesView: View {
    @StateObject private var viewModel = CategoriesViewModel()

    @State private var showCreateForm = false
    @State private var editingCategory: Category? = nil
    @State private var deleteError: String? = nil

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.categories.isEmpty {
                LoadingView()
            } else if let error = viewModel.error, viewModel.categories.isEmpty {
                ErrorView(message: error, onRetry: { Task { await viewModel.load() } })
            } else {
                listContent
            }
        }
        .navigationTitle("Categories")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { showCreateForm = true } label: { Image(systemName: "plus") }
            }
        }
        .sheet(isPresented: $showCreateForm) {
            NavigationStack {
                CategoryFormView(category: nil) { Task { await viewModel.load() } }
            }
        }
        .sheet(item: $editingCategory) { cat in
            NavigationStack {
                CategoryFormView(category: cat) { Task { await viewModel.load() } }
            }
        }
        .alert("Cannot Delete", isPresented: Binding(get: { deleteError != nil }, set: { if !$0 { deleteError = nil } })) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(deleteError ?? "")
        }
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
    }

    private var listContent: some View {
        VStack(spacing: 0) {
            // Type filter
            Picker("Type", selection: $viewModel.selectedType) {
                Text("All").tag(TransactionType?.none)
                Text("Income").tag(TransactionType?.some(.income))
                Text("Expense").tag(TransactionType?.some(.expense))
            }
            .pickerStyle(.segmented)
            .padding()

            if viewModel.displayedCategories.isEmpty {
                EmptyStateView(
                    icon: "tag",
                    title: "No Categories",
                    subtitle: "Tap + to add a category.",
                    actionTitle: "Add",
                    action: { showCreateForm = true }
                )
            } else {
                List {
                    ForEach(viewModel.displayedCategories) { cat in
                        HStack(spacing: 12) {
                            if let icon = cat.icon {
                                Text(icon).font(.title3)
                            } else {
                                Image(systemName: "tag.fill")
                                    .foregroundStyle(cat.color.flatMap { Color(hex: $0) } ?? .accentColor)
                            }
                            VStack(alignment: .leading, spacing: 2) {
                                Text(cat.name).font(.subheadline.weight(.medium))
                                Text(cat.typeName).font(.caption).foregroundStyle(.secondary)
                            }
                            Spacer()
                            if cat.isDefault == true {
                                Text("Default").font(.caption2)
                                    .padding(.horizontal, 6).padding(.vertical, 2)
                                    .background(.gray.opacity(0.15), in: Capsule())
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .swipeActions(edge: .trailing) {
                            if cat.isDefault != true {
                                Button(role: .destructive) {
                                    Task { await viewModel.delete(id: cat.id)
                                        if let err = viewModel.error { deleteError = err }
                                    }
                                } label: { Label("Delete", systemImage: "trash") }

                                Button {
                                    editingCategory = cat
                                } label: { Label("Edit", systemImage: "pencil") }
                                    .tint(.blue)
                            }
                        }
                        .contentShape(Rectangle())
                        .onTapGesture {
                            if cat.isDefault != true { editingCategory = cat }
                        }
                    }
                }
                .listStyle(.plain)
            }
        }
    }
}

#Preview {
    NavigationStack { CategoriesView() }
}
