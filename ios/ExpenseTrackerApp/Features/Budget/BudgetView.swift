import SwiftUI

struct BudgetView: View {
    @StateObject private var viewModel = BudgetViewModel()

    @State private var showCreateForm = false
    @State private var editingRecord: BudgetRecord? = nil
    @State private var showCopyConfirm = false

    var body: some View {
        ZStack {
            Color.appBackground.ignoresSafeArea()

            Group {
                if viewModel.isLoading && viewModel.overview == nil {
                    LoadingView()
                } else if let error = viewModel.error, viewModel.overview == nil {
                    ErrorView(message: error, onRetry: { Task { await viewModel.load() } })
                } else {
                    listContent
                }
            }
        }
        .navigationTitle("Ngân sách")
        .navigationBarTitleDisplayMode(.large)
        .toolbarBackground(Color.appBackground, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .toolbar { toolbarContent }
        .sheet(isPresented: $showCreateForm) {
            NavigationStack {
                BudgetFormView(budgetRecord: nil, year: viewModel.year, month: viewModel.month) {
                    Task { await viewModel.load() }
                }
            }
        }
        .sheet(item: $editingRecord) { record in
            NavigationStack {
                BudgetFormView(budgetRecord: record, year: viewModel.year, month: viewModel.month) {
                    Task { await viewModel.load() }
                }
            }
        }
        .confirmationDialog(
            "Sao chép ngân sách từ tháng trước?",
            isPresented: $showCopyConfirm,
            titleVisibility: .visible
        ) {
            Button("Sao chép (bỏ qua mục đã có)") {
                Task { await viewModel.copyFromPreviousMonth() }
            }
            Button("Huỷ", role: .cancel) {}
        }
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
    }

    // MARK: - Toolbar

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .topBarTrailing) {
            Menu {
                Button(action: { showCreateForm = true }) {
                    Label("Thêm ngân sách", systemImage: "plus")
                }
                Button(action: { showCopyConfirm = true }) {
                    Label("Sao chép từ tháng trước", systemImage: "doc.on.doc")
                }
            } label: {
                Image(systemName: "ellipsis.circle")
                    .foregroundStyle(Color.textSecondary)
            }
        }
    }

    // MARK: - Content

    private var listContent: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                MonthYearPicker(year: $viewModel.year, month: $viewModel.month)
                    .onChange(of: viewModel.month) { _, _ in Task { await viewModel.load() } }
                    .onChange(of: viewModel.year) { _, _ in Task { await viewModel.load() } }

                if let ov = viewModel.overview {
                    summaryCards(ov)
                    categoryList(ov)
                }

                if let error = viewModel.error {
                    HStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                        Text(error).font(.footnote)
                    }
                    .foregroundStyle(.red)
                    .padding(12)
                    .background(Color.red.opacity(0.1), in: RoundedRectangle(cornerRadius: 10))
                }
            }
            .padding(16)
        }
    }

    private func summaryCards(_ ov: BudgetOverview) -> some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                GradientSummaryCard(
                    title: "Kế hoạch",
                    amount: ov.totalPlanned,
                    icon: "target",
                    gradient: AppGradient.balance
                )
                GradientSummaryCard(
                    title: "Đã chi",
                    amount: ov.totalSpent,
                    icon: "arrow.up.circle.fill",
                    gradient: AppGradient.expense
                )
            }

            HStack(spacing: 12) {
                GradientSummaryCard(
                    title: "Còn lại",
                    amount: ov.totalRemaining,
                    icon: "checkmark.circle.fill",
                    gradient: AppGradient.income
                )

                // Status summary card
                VStack(alignment: .leading, spacing: 8) {
                    statusRow(count: ov.overBudgetCount, label: "Vượt ngân sách", color: Color.expenseRed)
                    statusRow(count: ov.nearLimitCount, label: "Gần giới hạn", color: .orange)
                    statusRow(count: ov.onTrackCount, label: "Ổn định", color: Color.incomeGreen)
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .glassCard()
            }
        }
    }

    private func statusRow(count: Int, label: String, color: Color) -> some View {
        HStack(spacing: 6) {
            Circle().fill(color).frame(width: 7, height: 7)
            Text("\(count) \(label)")
                .font(.caption)
                .foregroundStyle(Color.textSecondary)
        }
    }

    private func categoryList(_ ov: BudgetOverview) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Danh mục", action: { showCreateForm = true }, actionTitle: "+ Thêm")

            if ov.categories.isEmpty {
                MinimalEmptyState(
                    icon: "chart.bar",
                    title: "Chưa có ngân sách",
                    subtitle: "Thiết lập ngân sách cho từng danh mục",
                    actionTitle: "Thêm ngân sách",
                    action: { showCreateForm = true }
                )
                .glassCard()
            } else {
                VStack(spacing: 8) {
                    ForEach(ov.categories) { item in
                        BudgetCategoryRow(
                            item: item,
                            onEdit: {
                                guard let bid = item.budgetId else { return }
                                Task {
                                    if let r = await viewModel.fetchBudgetRecord(budgetId: bid) {
                                        editingRecord = r
                                    }
                                }
                            },
                            onDelete: {
                                guard let bid = item.budgetId else { return }
                                Task { await viewModel.deleteBudget(id: bid) }
                            }
                        )
                    }
                }
            }
        }
    }
}

// MARK: - Budget Category Row

private struct BudgetCategoryRow: View {
    let item: BudgetStatus
    let onEdit: () -> Void
    let onDelete: () -> Void
    @State private var showDeleteConfirm = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                // Category icon
                ZStack {
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .fill(Color(hex: item.categoryColor ?? "#888888").opacity(0.18))
                        .frame(width: 38, height: 38)
                    Text(item.categoryIcon ?? "📦")
                        .font(.system(size: 18))
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(item.categoryName)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color.textPrimary)
                    if item.hasBudget {
                        Text("\(item.spentAmount.currency) / \(item.plannedAmount.currency)")
                            .font(.caption)
                            .foregroundStyle(Color.textTertiary)
                    } else {
                        Text("Chưa đặt ngân sách")
                            .font(.caption)
                            .foregroundStyle(Color.textTertiary)
                    }
                }

                Spacer()

                if item.hasBudget {
                    statusBadge
                }

                Menu {
                    if item.hasBudget {
                        Button("Sửa", action: onEdit)
                        Button("Xoá", role: .destructive) { showDeleteConfirm = true }
                    }
                } label: {
                    Image(systemName: "ellipsis")
                        .foregroundStyle(Color.textTertiary)
                        .padding(6)
                }
            }

            if item.hasBudget {
                BudgetProgressBar(
                    percent: item.usedPercent,
                    isOverBudget: item.isOverBudget,
                    isNearLimit: item.isNearLimit
                )
                HStack {
                    Text("\(Int(item.usedPercent))% đã dùng")
                        .font(.caption2)
                        .foregroundStyle(Color.textTertiary)
                    Spacer()
                    Text("Còn \(item.remainingAmount.currency)")
                        .font(.caption2)
                        .foregroundStyle(item.isOverBudget ? Color.expenseRed : Color.incomeGreen)
                }
            }
        }
        .padding(14)
        .glassCard()
        .confirmationDialog("Xoá ngân sách cho \(item.categoryName)?", isPresented: $showDeleteConfirm, titleVisibility: .visible) {
            Button("Xoá", role: .destructive, action: onDelete)
            Button("Huỷ", role: .cancel) {}
        }
    }

    private var statusBadge: some View {
        Group {
            if item.isOverBudget {
                Text("Vượt")
                    .font(.caption2.weight(.semibold))
                    .padding(.horizontal, 8).padding(.vertical, 4)
                    .background(Color.expenseRed.opacity(0.15), in: Capsule())
                    .foregroundStyle(Color.expenseRed)
            } else if item.isNearLimit {
                Text("Sắp hết")
                    .font(.caption2.weight(.semibold))
                    .padding(.horizontal, 8).padding(.vertical, 4)
                    .background(Color.orange.opacity(0.15), in: Capsule())
                    .foregroundStyle(.orange)
            }
        }
    }
}

#Preview {
    NavigationStack { BudgetView() }
}
