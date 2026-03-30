import SwiftUI

struct SavingsView: View {
    @StateObject private var viewModel = SavingsViewModel()

    @State private var showCreateForm = false
    @State private var selectedAccount: SavingsAccount? = nil
    @State private var editingAccount: SavingsAccount? = nil

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.accounts.isEmpty {
                LoadingView()
            } else if let error = viewModel.error, viewModel.accounts.isEmpty {
                ErrorView(message: error, onRetry: { Task { await viewModel.load() } })
            } else {
                mainContent
            }
        }
        .navigationTitle("Savings")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { showCreateForm = true } label: { Image(systemName: "plus") }
            }
        }
        .sheet(isPresented: $showCreateForm) {
            NavigationStack {
                SavingsAccountFormView(account: nil) { Task { await viewModel.load() } }
            }
        }
        .sheet(item: $editingAccount) { acct in
            NavigationStack {
                SavingsAccountFormView(account: acct) { Task { await viewModel.load() } }
            }
        }
        .sheet(item: $selectedAccount) { acct in
            NavigationStack {
                SavingsDetailView(account: acct, onChanged: { Task { await viewModel.load() } })
            }
        }
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
    }

    private var mainContent: some View {
        ScrollView {
            VStack(spacing: 20) {
                if let s = viewModel.summary { summaryCards(s) }

                Picker("Status", selection: $viewModel.selectedTab) {
                    ForEach(SavingsViewModel.SavingsTab.allCases) { tab in
                        Text(tab.rawValue).tag(tab)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)

                if viewModel.displayedAccounts.isEmpty {
                    EmptyStateView(
                        icon: "banknote",
                        title: "No Accounts",
                        subtitle: "Tap + to add a savings or investment account.",
                        actionTitle: viewModel.selectedTab == .all ? "Add Account" : nil,
                        action: viewModel.selectedTab == .all ? { showCreateForm = true } : nil
                    )
                } else {
                    LazyVStack(spacing: 12) {
                        ForEach(viewModel.displayedAccounts) { acct in
                            SavingsAccountCard(account: acct)
                                .contentShape(Rectangle())
                                .onTapGesture { selectedAccount = acct }
                                .contextMenu {
                                    if acct.status != .closed {
                                        Button("Edit") { editingAccount = acct }
                                        Button("View Details") { selectedAccount = acct }
                                        if acct.currentValue == 0 {
                                            Button("Delete", role: .destructive) {
                                                Task { await viewModel.delete(id: acct.id) }
                                            }
                                        }
                                    }
                                }
                        }
                    }
                    .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
    }

    private func summaryCards(_ s: SavingsSummary) -> some View {
        LazyVGrid(columns: [.init(.flexible()), .init(.flexible())], spacing: 12) {
            SummaryCardView(title: "Deposited", amount: s.totalDeposited, icon: "banknote.fill", tint: .blue)
            SummaryCardView(
                title: "Current Value",
                amount: s.totalCurrentValue,
                icon: "chart.line.uptrend.xyaxis",
                tint: s.totalProfitLoss >= 0 ? .green : .red
            )
            SummaryCardView(
                title: "Profit / Loss",
                amount: s.totalProfitLoss,
                icon: s.totalProfitLoss >= 0 ? "arrow.up.right.circle.fill" : "arrow.down.right.circle.fill",
                tint: s.totalProfitLoss >= 0 ? .green : .red,
                subtitle: String(format: "%.1f%%", s.totalProfitPercent)
            )
            VStack(alignment: .leading, spacing: 4) {
                HStack { Circle().fill(.green).frame(width: 8, height: 8); Text("Active: \(s.activeCount)").font(.caption) }
                HStack { Circle().fill(.orange).frame(width: 8, height: 8); Text("Matured: \(s.maturedCount)").font(.caption) }
                HStack { Circle().fill(.gray).frame(width: 8, height: 8); Text("Closed: \(s.closedCount)").font(.caption) }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
        }
        .padding(.horizontal)
    }
}

// MARK: - Account Card

private struct SavingsAccountCard: View {
    let account: SavingsAccount

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: account.type.sfSymbol)
                    .foregroundStyle(.blue)
                VStack(alignment: .leading, spacing: 2) {
                    Text(account.name).font(.subheadline.weight(.semibold))
                    Text(account.typeName).font(.caption).foregroundStyle(.secondary)
                }
                Spacer()
                Text(account.statusName)
                    .font(.caption2).padding(.horizontal, 6).padding(.vertical, 2)
                    .background(statusColor.opacity(0.15), in: Capsule())
                    .foregroundStyle(statusColor)
            }

            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Current Value").font(.caption).foregroundStyle(.secondary)
                    Text(account.currentValue.currency).font(.headline)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text("P/L").font(.caption).foregroundStyle(.secondary)
                    Text(account.profitLoss.currency)
                        .font(.subheadline.bold())
                        .foregroundStyle(account.isProfit ? .green : .red)
                }
            }

            if let maturity = account.maturityDate?.displayDate {
                Label("Matures: \(maturity)", systemImage: "calendar")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(14)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
    }

    private var statusColor: Color {
        switch account.status {
        case .active: return .green
        case .matured: return .orange
        case .closed: return .gray
        }
    }
}

#Preview {
    NavigationStack { SavingsView() }
}
