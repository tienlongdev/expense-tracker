import SwiftUI

struct BudgetView: View {
    @StateObject private var viewModel = BudgetViewModel()

    @State private var showCreateForm = false
    @State private var editingRecord: BudgetRecord? = nil
    @State private var showCopyConfirm = false

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.overview == nil {
                LoadingView()
            } else if let error = viewModel.error, viewModel.overview == nil {
                ErrorView(message: error, onRetry: { Task { await viewModel.load() } })
            } else {
                listContent
            }
        }
        .navigationTitle("Budget")
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
            "Copy budgets from previous month?",
            isPresented: $showCopyConfirm,
            titleVisibility: .visible
        ) {
            Button("Copy (skip existing)") {
                Task { await viewModel.copyFromPreviousMonth() }
            }
            Button("Cancel", role: .cancel) {}
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
                    Label("Add Budget", systemImage: "plus")
                }
                Button(action: { showCopyConfirm = true }) {
                    Label("Copy from Previous Month", systemImage: "doc.on.doc")
                }
            } label: {
                Image(systemName: "ellipsis.circle")
            }
        }
    }

    // MARK: - Content

    private var listContent: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Month picker
                HStack {
                    MonthYearPicker(year: $viewModel.year, month: $viewModel.month)
                        .onChange(of: viewModel.month) { _, _ in Task { await viewModel.load() } }
                        .onChange(of: viewModel.year) { _, _ in Task { await viewModel.load() } }
                    Spacer()
                }
                .padding(.horizontal)

                if let ov = viewModel.overview {
                    // Summary cards
                    summaryCards(ov)
                        .padding(.horizontal)

                    // Category list
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Categories")
                            .font(.headline)
                            .padding(.horizontal)

                        if ov.categories.isEmpty {
                            EmptyStateView(
                                icon: "chart.bar",
                                title: "No Budgets",
                                subtitle: "Tap + to set a budget for a category.",
                                actionTitle: "Add Budget",
                                action: { showCreateForm = true }
                            )
                        } else {
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
                                .padding(.horizontal)
                                Divider().padding(.leading)
                            }
                        }
                    }
                }

                if let error = viewModel.error {
                    Text(error)
                        .foregroundStyle(.red)
                        .font(.footnote)
                        .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
    }

    private func summaryCards(_ ov: BudgetOverview) -> some View {
        LazyVGrid(columns: [.init(.flexible()), .init(.flexible())], spacing: 12) {
            SummaryCardView(title: "Planned", amount: ov.totalPlanned, icon: "target", tint: .blue)
            SummaryCardView(title: "Spent", amount: ov.totalSpent, icon: "arrow.up.circle.fill", tint: .red)
            SummaryCardView(title: "Remaining", amount: ov.totalRemaining, icon: "checkmark.circle.fill", tint: .green)
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 4) {
                    Circle().fill(.red).frame(width: 8, height: 8)
                    Text("Over: \(ov.overBudgetCount)").font(.caption)
                    Circle().fill(.orange).frame(width: 8, height: 8)
                    Text("Near: \(ov.nearLimitCount)").font(.caption)
                }
                HStack(spacing: 4) {
                    Circle().fill(.green).frame(width: 8, height: 8)
                    Text("OK: \(ov.onTrackCount)").font(.caption)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
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
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                if let icon = item.categoryIcon { Text(icon) }
                Text(item.categoryName)
                    .font(.subheadline.weight(.medium))
                Spacer()
                statusBadge
                Menu {
                    if item.hasBudget {
                        Button("Edit", action: onEdit)
                        Button("Delete", role: .destructive) { showDeleteConfirm = true }
                    }
                } label: {
                    Image(systemName: "ellipsis")
                        .foregroundStyle(.secondary)
                }
            }

            if item.hasBudget {
                BudgetProgressBar(
                    percent: item.usedPercent,
                    isOverBudget: item.isOverBudget,
                    isNearLimit: item.isNearLimit
                )

                HStack {
                    Text("Spent: \(item.spentAmount.currency)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Text("of \(item.plannedAmount.currency)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            } else {
                Text("No budget set")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(.vertical, 6)
        .confirmationDialog("Delete budget for \(item.categoryName)?", isPresented: $showDeleteConfirm, titleVisibility: .visible) {
            Button("Delete", role: .destructive, action: onDelete)
            Button("Cancel", role: .cancel) {}
        }
    }

    private var statusBadge: some View {
        Group {
            if item.isOverBudget {
                Text("Over").font(.caption2).padding(.horizontal, 6).padding(.vertical, 2)
                    .background(.red.opacity(0.15), in: Capsule()).foregroundStyle(.red)
            } else if item.isNearLimit {
                Text("Near limit").font(.caption2).padding(.horizontal, 6).padding(.vertical, 2)
                    .background(.orange.opacity(0.15), in: Capsule()).foregroundStyle(.orange)
            }
        }
    }
}

#Preview {
    NavigationStack { BudgetView() }
}
