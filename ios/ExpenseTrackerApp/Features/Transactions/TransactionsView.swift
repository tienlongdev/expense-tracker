import SwiftUI

struct TransactionsView: View {
    @StateObject private var viewModel = TransactionsViewModel()

    @State private var showCreateForm = false
    @State private var editingTransaction: Transaction? = nil
    @State private var showFilters = false
    @State private var deletingId: String? = nil

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.transactions.isEmpty {
                LoadingView()
            } else if let error = viewModel.error, viewModel.transactions.isEmpty {
                ErrorView(message: error, onRetry: {
                    Task { await viewModel.load() }
                })
            } else {
                listContent
            }
        }
        .navigationTitle("Transactions")
        .toolbar { toolbarContent }
        .sheet(isPresented: $showCreateForm) {
            NavigationStack {
                TransactionFormView(transaction: nil) {
                    Task { await viewModel.load() }
                }
            }
        }
        .sheet(item: $editingTransaction) { tx in
            NavigationStack {
                TransactionFormView(transaction: tx) {
                    Task { await viewModel.load() }
                }
            }
        }
        .sheet(isPresented: $showFilters) {
            filterSheet
        }
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
    }

    // MARK: - Toolbar

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button {
                showFilters = true
            } label: {
                Image(systemName: viewModel.isFiltered ? "line.3.horizontal.decrease.circle.fill" : "line.3.horizontal.decrease.circle")
            }
        }
        ToolbarItem(placement: .topBarTrailing) {
            Button {
                showCreateForm = true
            } label: {
                Image(systemName: "plus")
            }
        }
    }

    // MARK: - List

    private var listContent: some View {
        List {
            if viewModel.transactions.isEmpty {
                EmptyStateView(
                    icon: "tray",
                    title: "No Transactions",
                    subtitle: "Tap + to record a new transaction.",
                    actionTitle: "Add",
                    action: { showCreateForm = true }
                )
                .listRowSeparator(.hidden)
            } else {
                ForEach(viewModel.transactions) { tx in
                    TransactionRowView(transaction: tx)
                        .contentShape(Rectangle())
                        .onTapGesture { editingTransaction = tx }
                        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                            Button(role: .destructive) {
                                deletingId = tx.id
                                Task { await viewModel.delete(id: tx.id) }
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                        }
                        .swipeActions(edge: .leading) {
                            Button {
                                editingTransaction = tx
                            } label: {
                                Label("Edit", systemImage: "pencil")
                            }
                            .tint(.blue)
                        }
                }
                if viewModel.hasMore {
                    HStack {
                        Spacer()
                        if viewModel.isLoadingMore {
                            ProgressView()
                        } else {
                            Button("Load More") {
                                Task { await viewModel.loadMore() }
                            }
                            .font(.subheadline)
                        }
                        Spacer()
                    }
                    .listRowSeparator(.hidden)
                }
            }
        }
        .listStyle(.plain)
    }

    // MARK: - Filter Sheet

    private var filterSheet: some View {
        NavigationStack {
            Form {
                Section("Search") {
                    TextField("Title...", text: $viewModel.filterTitle)
                        .autocorrectionDisabled()
                }
                Section("Type") {
                    Picker("Type", selection: $viewModel.filterType) {
                        Text("All").tag(TransactionType?.none)
                        Text("Income").tag(TransactionType?.some(.income))
                        Text("Expense").tag(TransactionType?.some(.expense))
                    }
                    .pickerStyle(.segmented)
                }
                Section("Date Range") {
                    DatePicker(
                        "From",
                        selection: Binding(
                            get: { viewModel.filterFromDate ?? Date() },
                            set: { viewModel.filterFromDate = $0 }
                        ),
                        displayedComponents: .date
                    )
                    Toggle("Has start date", isOn: Binding(
                        get: { viewModel.filterFromDate != nil },
                        set: { viewModel.filterFromDate = $0 ? Date() : nil }
                    ))

                    DatePicker(
                        "To",
                        selection: Binding(
                            get: { viewModel.filterToDate ?? Date() },
                            set: { viewModel.filterToDate = $0 }
                        ),
                        displayedComponents: .date
                    )
                    Toggle("Has end date", isOn: Binding(
                        get: { viewModel.filterToDate != nil },
                        set: { viewModel.filterToDate = $0 ? Date() : nil }
                    ))
                }
                if viewModel.isFiltered {
                    Section {
                        Button("Clear All Filters", role: .destructive) {
                            Task {
                                await viewModel.clearFilters()
                                showFilters = false
                            }
                        }
                    }
                }
            }
            .navigationTitle("Filter")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { showFilters = false }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Apply") {
                        Task {
                            await viewModel.applyFilters()
                            showFilters = false
                        }
                    }
                    .fontWeight(.semibold)
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        TransactionsView()
    }
}
