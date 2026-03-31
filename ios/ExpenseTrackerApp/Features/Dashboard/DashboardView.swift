import SwiftUI

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    @EnvironmentObject private var appState: AppState

    @State private var showNotifications = false
    @State private var showCalendar = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()

                Group {
                    if viewModel.isLoading && viewModel.summary == nil {
                        loadingView
                    } else if let error = viewModel.error, viewModel.summary == nil {
                        ErrorView(message: error, onRetry: {
                            Task { await viewModel.load() }
                        })
                    } else {
                        scrollContent
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { toolbarContent }
            .sheet(isPresented: $showCalendar) {
                NavigationStack {
                    TransactionCalendarView()
                }
            }
            .overlay {
                if showNotifications {
                    notificationsModal
                }
            }
        }
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
        .animation(.easeInOut(duration: 0.2), value: showNotifications)
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
            VStack(alignment: .leading, spacing: 2) {
                Text("Xin chào 👋")
                    .font(.caption)
                    .foregroundStyle(Color.textSecondary)
                Text("Tổng quan")
                    .font(.headline.bold())
                    .foregroundStyle(Color.textPrimary)
            }
        }
        ToolbarItem(placement: .topBarTrailing) {
            HStack(spacing: 8) {
                Button {
                    showCalendar = true
                } label: {
                    Image(systemName: "calendar")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(Color.textSecondary)
                        .frame(width: 32, height: 32)
                        .background(Color.surfaceColor, in: Circle())
                }
                .buttonStyle(.plain)

                Button {
                    showNotifications = true
                } label: {
                    ZStack(alignment: .topTrailing) {
                        Image(systemName: "bell.fill")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundStyle(Color.textSecondary)
                            .frame(width: 32, height: 32)
                            .background(Color.surfaceColor, in: Circle())
                        if appState.unreadNotificationCount > 0 {
                            Text("\(min(appState.unreadNotificationCount, 9))")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundStyle(.white)
                                .frame(width: 14, height: 14)
                                .background(.red, in: Circle())
                                .offset(x: 6, y: -4)
                        }
                    }
                    .frame(width: 38, height: 38)
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Main Content

    private var scrollContent: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 24) {
                monthPickerRow

                if let summary = viewModel.summary {
                    summarySection(summary)
                }

                chartSection

                recentSection
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 16)
        }
    }

    private var monthPickerRow: some View {
        MonthYearPicker(year: $viewModel.selectedYear, month: $viewModel.selectedMonth)
            .onChange(of: viewModel.selectedMonth) { _, _ in
                Task { await viewModel.loadOnMonthChange() }
            }
            .onChange(of: viewModel.selectedYear) { _, _ in
                Task { await viewModel.loadOnMonthChange() }
            }
    }

    private func summarySection(_ s: SummaryDto) -> some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                GradientSummaryCard(
                    title: "Thu nhập",
                    amount: s.totalIncome,
                    icon: "arrow.down.circle.fill",
                    gradient: AppGradient.income
                )
                GradientSummaryCard(
                    title: "Chi tiêu",
                    amount: s.totalExpense,
                    icon: "arrow.up.circle.fill",
                    gradient: AppGradient.expense
                )
            }
            GradientSummaryCard(
                title: "Số dư",
                amount: s.balance,
                icon: "wallet.pass.fill",
                gradient: s.balance >= 0 ? AppGradient.balance : AppGradient.expense,
                isFullWidth: true
            )
        }
    }

    private var chartSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionHeader(title: "Biểu đồ tháng")

            if viewModel.yearlyReport.isEmpty {
                HStack {
                    Spacer()
                    VStack(spacing: 8) {
                        Image(systemName: "chart.bar.xaxis")
                            .font(.system(size: 36, weight: .light))
                            .foregroundStyle(Color.textTertiary)
                        Text("Chưa có dữ liệu \(viewModel.selectedYear)")
                            .font(.subheadline)
                            .foregroundStyle(Color.textTertiary)
                    }
                    Spacer()
                }
                .frame(height: 120)
                .glassCard()
            } else {
                BarChartView(data: viewModel.yearlyReport)
                    .frame(height: 220)
                    .padding(16)
                    .glassCard()
            }
        }
    }

    private var recentSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionHeader(title: "Giao dịch gần đây")

            if viewModel.recentTransactions.isEmpty {
                MinimalEmptyState(
                    icon: "tray",
                    title: "Chưa có giao dịch",
                    subtitle: "Thêm giao dịch đầu tiên của bạn"
                )
                .glassCard()
            } else {
                VStack(spacing: 0) {
                    ForEach(viewModel.recentTransactions) { tx in
                        TransactionRowView(transaction: tx)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 10)
                        if tx.id != viewModel.recentTransactions.last?.id {
                            Divider()
                                .background(Color.borderColor)
                                .padding(.horizontal, 14)
                        }
                    }
                }
                .glassCard()
            }
        }
    }

    // MARK: - Notifications Modal

    private var notificationsModal: some View {
        GeometryReader { proxy in
            ZStack(alignment: .top) {
                Color.black.opacity(0.5)
                    .ignoresSafeArea()
                    .contentShape(Rectangle())
                    .onTapGesture { showNotifications = false }

                NavigationStack {
                    NotificationsView(onClose: { showNotifications = false })
                }
                .frame(maxWidth: .infinity)
                .frame(height: proxy.size.height * 0.9)
                .background(Color.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
                .shadow(color: .black.opacity(0.4), radius: 24, y: 8)
                .padding(.horizontal, 8)
                .padding(.top, 8)
                .transition(.move(edge: .bottom).combined(with: .opacity))
                .onTapGesture { }
            }
        }
    }
}

#Preview {
    DashboardView()
        .environmentObject(AppState())
}
