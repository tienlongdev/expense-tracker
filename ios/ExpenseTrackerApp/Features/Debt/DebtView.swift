import SwiftUI

struct DebtView: View {
    @StateObject private var viewModel = DebtViewModel()

    @State private var showCreateForm = false
    @State private var editingDebt: Debt? = nil
    @State private var selectedDebt: Debt? = nil

    var body: some View {
        ZStack {
            Color.appBackground.ignoresSafeArea()

            Group {
                if viewModel.isLoading && viewModel.allDebts.isEmpty {
                    LoadingView()
                } else if let error = viewModel.error, viewModel.allDebts.isEmpty {
                    ErrorView(message: error, onRetry: { Task { await viewModel.load() } })
                } else {
                    mainContent
                }
            }
        }
        .navigationTitle("Quản lý nợ")
        .navigationBarTitleDisplayMode(.large)
        .toolbarBackground(Color.appBackground, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .toolbar {
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
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                if let s = viewModel.summary { summaryCards(s) }

                // Filter tabs
                HStack(spacing: 0) {
                    ForEach(DebtViewModel.DebtTab.allCases) { tab in
                        let isSelected = viewModel.selectedTab == tab
                        Button {
                            withAnimation(.spring(response: 0.3)) {
                                viewModel.selectedTab = tab
                            }
                        } label: {
                            Text(tab.rawValue)
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(isSelected ? .white : Color.textTertiary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background {
                                    if isSelected {
                                        Capsule().fill(AppGradient.primary).padding(4)
                                    }
                                }
                        }
                    }
                }
                .background(Color.surfaceColor, in: RoundedRectangle(cornerRadius: 14))

                if viewModel.displayedDebts.isEmpty {
                    MinimalEmptyState(
                        icon: "creditcard",
                        title: "Chưa có khoản nợ",
                        subtitle: viewModel.selectedTab == .all
                            ? "Nhấn + để thêm khoản nợ mới"
                            : "Không có khoản nợ trong danh mục này",
                        actionTitle: viewModel.selectedTab == .all ? "Thêm khoản nợ" : nil,
                        action: viewModel.selectedTab == .all ? { showCreateForm = true } : nil
                    )
                    .glassCard()
                } else {
                    VStack(spacing: 8) {
                        ForEach(viewModel.displayedDebts) { debt in
                            DebtRowView(debt: debt)
                                .contentShape(Rectangle())
                                .onTapGesture { selectedDebt = debt }
                                .contextMenu {
                                    Button("Sửa") { editingDebt = debt }
                                    if debt.status == .unpaid {
                                        Button("Xoá", role: .destructive) {
                                            Task { await viewModel.delete(id: debt.id) }
                                        }
                                    }
                                }
                        }
                    }
                }
            }
            .padding(16)
        }
    }

    private func summaryCards(_ s: DebtSummary) -> some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                GradientSummaryCard(
                    title: "Đang vay",
                    amount: s.totalBorrowed,
                    icon: "arrow.down.circle.fill",
                    gradient: AppGradient.expense
                )
                GradientSummaryCard(
                    title: "Đã cho vay",
                    amount: s.totalLent,
                    icon: "arrow.up.circle.fill",
                    gradient: AppGradient.income
                )
            }

            if s.overdueCount > 0 {
                HStack(spacing: 10) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(.orange)
                    Text("\(s.overdueCount) khoản nợ quá hạn")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.orange)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(.orange.opacity(0.6))
                }
                .padding(14)
                .background(Color.orange.opacity(0.10), in: RoundedRectangle(cornerRadius: 14))
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(Color.orange.opacity(0.3), lineWidth: 0.5)
                )
            }
        }
    }
}

// MARK: - Debt Row

private struct DebtRowView: View {
    let debt: Debt

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(typeColor.opacity(0.15))
                    .frame(width: 44, height: 44)
                Image(systemName: debt.type == .borrowed
                      ? "arrow.down.circle.fill"
                      : "arrow.up.circle.fill")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(typeColor)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(debt.title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Color.textPrimary)
                    .lineLimit(1)
                Text(debt.personName)
                    .font(.caption.weight(.medium))
                    .foregroundStyle(Color.textSecondary)
                if let due = debt.dueDate?.displayDate {
                    HStack(spacing: 4) {
                        if debt.isOverdue {
                            Image(systemName: "exclamationmark.circle.fill")
                                .font(.caption2)
                                .foregroundStyle(.orange)
                        }
                        Text("Hạn: \(due)")
                            .font(.caption2)
                            .foregroundStyle(debt.isOverdue ? .orange : Color.textTertiary)
                    }
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text(debt.remainingAmount.currency)
                    .font(.subheadline.bold())
                    .foregroundStyle(Color.textPrimary)
                Text(debt.statusName)
                    .font(.caption2.weight(.semibold))
                    .padding(.horizontal, 8).padding(.vertical, 3)
                    .background(statusColor(debt.status).opacity(0.15), in: Capsule())
                    .foregroundStyle(statusColor(debt.status))
            }
        }
        .padding(14)
        .glassCard()
    }

    private var typeColor: Color {
        debt.type == .borrowed ? Color.expenseRed : Color.incomeGreen
    }

    private func statusColor(_ s: DebtStatus) -> Color {
        switch s {
        case .unpaid: return Color.expenseRed
        case .partiallyPaid: return .orange
        case .paid: return Color.incomeGreen
        }
    }
}

#Preview {
    NavigationStack { DebtView() }
}
