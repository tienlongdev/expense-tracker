import SwiftUI

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    @EnvironmentObject private var appState: AppState

    @State private var showNotifications = false
    @State private var showCalendar = false

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.summary == nil {
                    LoadingView()
                } else if let error = viewModel.error, viewModel.summary == nil {
                    ErrorView(message: error, onRetry: {
                        Task { await viewModel.load() }
                    })
                } else {
                    scrollContent
                }
            }
            .navigationTitle("Dashboard")
            .toolbar { toolbarContent }
            .sheet(isPresented: $showNotifications) {
                NotificationsView()
            }
            .sheet(isPresented: $showCalendar) {
                NavigationStack {
                    TransactionCalendarView()
                }
            }
        }
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
    }

    // MARK: - Toolbar

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .topBarTrailing) {
            Button {
                showNotifications = true
            } label: {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: "bell.fill")
                    if appState.unreadNotificationCount > 0 {
                        Text("\(min(appState.unreadNotificationCount, 99))")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundStyle(.white)
                            .padding(3)
                            .background(.red, in: Circle())
                            .offset(x: 8, y: -8)
                    }
                }
            }
        }
    }

    // MARK: - Main Content

    private var scrollContent: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                monthPicker

                if let summary = viewModel.summary {
                    summaryCards(summary)
                }

                chartSection

                recentSection
            }
            .padding()
        }
    }

    private var monthPicker: some View {
        HStack {
            MonthYearPicker(year: $viewModel.selectedYear, month: $viewModel.selectedMonth)
                .onChange(of: viewModel.selectedMonth) { _, _ in
                    Task { await viewModel.loadOnMonthChange() }
                }
                .onChange(of: viewModel.selectedYear) { _, _ in
                    Task { await viewModel.loadOnMonthChange() }
                }
            Spacer()
            Button {
                showCalendar = true
            } label: {
                Image(systemName: "calendar")
                    .font(.title3)
            }
        }
    }

    private func summaryCards(_ s: SummaryDto) -> some View {
        LazyVGrid(columns: [.init(.flexible()), .init(.flexible())], spacing: 12) {
            SummaryCardView(
                title: "Income",
                amount: s.totalIncome,
                icon: "arrow.down.circle.fill",
                tint: .green
            )
            SummaryCardView(
                title: "Expense",
                amount: s.totalExpense,
                icon: "arrow.up.circle.fill",
                tint: .red
            )
            SummaryCardView(
                title: "Balance",
                amount: s.balance,
                icon: "wallet.pass.fill",
                tint: s.balance >= 0 ? .blue : .red
            )
                .gridCellColumns(2)
        }
    }

    private var chartSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Monthly Overview")
                .font(.headline)
            if viewModel.yearlyReport.isEmpty {
                Text("No data for \(viewModel.selectedYear)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(height: 120)
                    .frame(maxWidth: .infinity)
            } else {
                BarChartView(data: viewModel.yearlyReport)
                    .frame(height: 220)
            }
        }
    }

    private var recentSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Recent Transactions")
                    .font(.headline)
                Spacer()
            }
            if viewModel.recentTransactions.isEmpty {
                Text("No recent transactions")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(viewModel.recentTransactions) { tx in
                    TransactionRowView(transaction: tx)
                    if tx.id != viewModel.recentTransactions.last?.id {
                        Divider()
                    }
                }
            }
        }
        .padding(14)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
    }
}

#Preview {
    DashboardView()
        .environmentObject(AppState())
}
