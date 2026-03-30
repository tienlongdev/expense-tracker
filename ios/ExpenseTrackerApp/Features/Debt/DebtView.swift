import SwiftUI

struct DebtView: View {
    @StateObject private var viewModel = DebtViewModel()

    @State private var showCreateForm = false
    @State private var editingDebt: Debt? = nil
    @State private var selectedDebt: Debt? = nil

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.allDebts.isEmpty {
                LoadingView()
            } else if let error = viewModel.error, viewModel.allDebts.isEmpty {
                ErrorView(message: error, onRetry: { Task { await viewModel.load() } })
            } else {
                mainContent
            }
        }
        .navigationTitle("Debt")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { showCreateForm = true } label: { Image(systemName: "plus") }
            }
        }
        .sheet(isPresented: $showCreateForm) {
            NavigationStack {
                DebtFormView(debt: nil) { Task { await viewModel.load() } }
            }
        }
        .sheet(item: $editingDebt) { debt in
            NavigationStack {
                DebtFormView(debt: debt) { Task { await viewModel.load() } }
            }
        }
        .sheet(item: $selectedDebt) { debt in
            NavigationStack {
                DebtDetailView(debt: debt) { Task { await viewModel.load() } }
            }
        }
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
    }

    private var mainContent: some View {
        ScrollView {
            VStack(spacing: 20) {
                if let s = viewModel.summary { summaryCards(s) }

                Picker("Filter", selection: $viewModel.selectedTab) {
                    ForEach(DebtViewModel.DebtTab.allCases) { tab in
                        Text(tab.rawValue).tag(tab)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)

                if viewModel.displayedDebts.isEmpty {
                    EmptyStateView(
                        icon: "creditcard",
                        title: "No Debts",
                        subtitle: viewModel.selectedTab == .all ? "Tap + to add a debt record." : "No debts in this category.",
                        actionTitle: viewModel.selectedTab == .all ? "Add Debt" : nil,
                        action: viewModel.selectedTab == .all ? { showCreateForm = true } : nil
                    )
                } else {
                    LazyVStack(spacing: 0) {
                        ForEach(viewModel.displayedDebts) { debt in
                            DebtRowView(debt: debt)
                                .contentShape(Rectangle())
                                .onTapGesture { selectedDebt = debt }
                                .contextMenu {
                                    Button("Edit") { editingDebt = debt }
                                    if debt.status == .unpaid {
                                        Button("Delete", role: .destructive) {
                                            Task { await viewModel.delete(id: debt.id) }
                                        }
                                    }
                                }
                            Divider().padding(.leading)
                        }
                    }
                    .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
    }

    private func summaryCards(_ s: DebtSummary) -> some View {
        LazyVGrid(columns: [.init(.flexible()), .init(.flexible())], spacing: 12) {
            SummaryCardView(title: "Borrowed", amount: s.totalBorrowed, icon: "arrow.down.circle.fill", tint: .red,
                            subtitle: "Remaining: \(s.totalBorrowedRemaining.currency)")
            SummaryCardView(title: "Lent", amount: s.totalLent, icon: "arrow.up.circle.fill", tint: .green,
                            subtitle: "Remaining: \(s.totalLentRemaining.currency)")
            if s.overdueCount > 0 {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(.orange)
                    Text("\(s.overdueCount) overdue debt\(s.overdueCount == 1 ? "" : "s")")
                        .font(.subheadline.bold())
                        .foregroundStyle(.orange)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(14)
                .background(.orange.opacity(0.12), in: RoundedRectangle(cornerRadius: 14))
                .gridCellColumns(2)
            }
        }
        .padding(.horizontal)
    }
}

// MARK: - Row

private struct DebtRowView: View {
    let debt: Debt

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: debt.type == .borrowed ? "arrow.down.circle.fill" : "arrow.up.circle.fill")
                .font(.title2)
                .foregroundStyle(debt.type == .borrowed ? .red : .green)
                .frame(width: 44)

            VStack(alignment: .leading, spacing: 3) {
                Text(debt.title)
                    .font(.subheadline.weight(.medium))
                Text(debt.personName)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                if let due = debt.dueDate?.displayDate {
                    HStack(spacing: 3) {
                        if debt.isOverdue {
                            Image(systemName: "exclamationmark.circle.fill").foregroundStyle(.orange)
                        }
                        Text("Due: \(due)").font(.caption2).foregroundStyle(debt.isOverdue ? .orange : .tertiary)
                    }
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 3) {
                Text(debt.remainingAmount.currency)
                    .font(.subheadline.bold())
                Text(debt.statusName)
                    .font(.caption2)
                    .padding(.horizontal, 6).padding(.vertical, 2)
                    .background(statusColor(debt.status).opacity(0.15), in: Capsule())
                    .foregroundStyle(statusColor(debt.status))
            }
        }
        .padding(.vertical, 10)
    }

    private func statusColor(_ s: DebtStatus) -> Color {
        switch s {
        case .unpaid: return .red
        case .partiallyPaid: return .orange
        case .paid: return .green
        }
    }
}

#Preview {
    NavigationStack { DebtView() }
}
