import SwiftUI

struct TransactionsView: View {
    @StateObject private var viewModel = TransactionsViewModel()

    @State private var showCreateForm = false
    @State private var editingTransaction: Transaction? = nil
    @State private var showFilters = false

    var body: some View {
        ZStack {
            Color.appBackground.ignoresSafeArea()

            Group {
                if viewModel.isLoading && viewModel.transactions.isEmpty {
                    loadingView
                } else if let error = viewModel.error, viewModel.transactions.isEmpty {
                    ErrorView(message: error, onRetry: {
                        Task { await viewModel.load() }
                    })
                } else {
                    listContent
                }
            }
        }
        .navigationTitle("Giao dịch")
        .navigationBarTitleDisplayMode(.large)
        .toolbarBackground(Color.appBackground, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
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

    // MARK: - Loading

    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .tint(Color.accentPurple)
                .scaleEffect(1.2)
            Text("Đang tải...")
                .font(.subheadline)
                .foregroundStyle(Color.textSecondary)
        }
    }

    // MARK: - Toolbar

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button {
                showFilters = true
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: viewModel.isFiltered
                          ? "line.3.horizontal.decrease.circle.fill"
                          : "line.3.horizontal.decrease.circle")
                    if viewModel.isFiltered {
                        Text("Lọc")
                            .font(.caption.weight(.semibold))
                    }
                }
                .foregroundStyle(viewModel.isFiltered ? Color.accentPurple : Color.textSecondary)
            }
        }
        ToolbarItem(placement: .topBarTrailing) {
            Button {
                showCreateForm = true
            } label: {
                Image(systemName: "plus")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(.white)
                    .padding(8)
                    .background(AppGradient.primary, in: Circle())
            }
        }
    }

    // MARK: - List

    private var listContent: some View {
        ScrollView(showsIndicators: false) {
            LazyVStack(spacing: 0, pinnedViews: []) {
                if viewModel.transactions.isEmpty {
                    MinimalEmptyState(
                        icon: "tray",
                        title: "Chưa có giao dịch",
                        subtitle: "Nhấn + để thêm giao dịch mới",
                        actionTitle: "Thêm ngay",
                        action: { showCreateForm = true }
                    )
                    .padding(.top, 40)
                } else {
                    transactionList
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 16)
        }
    }

    private var transactionList: some View {
        VStack(spacing: 8) {
            ForEach(viewModel.transactions) { tx in
                TransactionRowView(transaction: tx)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 12)
                    .glassCard()
                    .contentShape(Rectangle())
                    .onTapGesture { editingTransaction = tx }
                    .contextMenu {
                        Button {
                            editingTransaction = tx
                        } label: {
                            Label("Sửa", systemImage: "pencil")
                        }
                        Button(role: .destructive) {
                            Task { await viewModel.delete(id: tx.id) }
                        } label: {
                            Label("Xoá", systemImage: "trash")
                        }
                    }
            }

            if viewModel.hasMore {
                Button {
                    Task { await viewModel.loadMore() }
                } label: {
                    HStack {
                        if viewModel.isLoadingMore {
                            ProgressView()
                                .tint(Color.accentPurple)
                        } else {
                            Text("Tải thêm")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(Color.accentPurple)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .glassCard()
                }
            }
        }
        .padding(.top, 8)
    }

    // MARK: - Filter Sheet

    private var filterSheet: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()

                Form {
                    Section {
                        TextField("Tìm theo tên...", text: $viewModel.filterTitle)
                            .autocorrectionDisabled()
                    } header: {
                        Text("TÌM KIẾM")
                            .foregroundStyle(Color.textTertiary)
                    }

                    Section {
                        Picker("Loại giao dịch", selection: $viewModel.filterType) {
                            Text("Tất cả").tag(TransactionType?.none)
                            Text("Thu nhập").tag(TransactionType?.some(.income))
                            Text("Chi tiêu").tag(TransactionType?.some(.expense))
                        }
                        .pickerStyle(.segmented)
                    } header: {
                        Text("LOẠI GIAO DỊCH")
                            .foregroundStyle(Color.textTertiary)
                    }

                    Section {
                        DatePicker(
                            "Từ ngày",
                            selection: Binding(
                                get: { viewModel.filterFromDate ?? Date() },
                                set: { viewModel.filterFromDate = $0 }
                            ),
                            displayedComponents: .date
                        )
                        Toggle("Có ngày bắt đầu", isOn: Binding(
                            get: { viewModel.filterFromDate != nil },
                            set: { viewModel.filterFromDate = $0 ? Date() : nil }
                        ))
                        DatePicker(
                            "Đến ngày",
                            selection: Binding(
                                get: { viewModel.filterToDate ?? Date() },
                                set: { viewModel.filterToDate = $0 }
                            ),
                            displayedComponents: .date
                        )
                        Toggle("Có ngày kết thúc", isOn: Binding(
                            get: { viewModel.filterToDate != nil },
                            set: { viewModel.filterToDate = $0 ? Date() : nil }
                        ))
                    } header: {
                        Text("KHOẢNG THỜI GIAN")
                            .foregroundStyle(Color.textTertiary)
                    }

                    if viewModel.isFiltered {
                        Section {
                            Button("Xoá tất cả bộ lọc", role: .destructive) {
                                Task {
                                    await viewModel.clearFilters()
                                    showFilters = false
                                }
                            }
                        }
                    }
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Bộ lọc")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Color.cardBackground, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Huỷ") { showFilters = false }
                        .foregroundStyle(Color.textSecondary)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Áp dụng") {
                        Task {
                            await viewModel.applyFilters()
                            showFilters = false
                        }
                    }
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.accentPurple)
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
