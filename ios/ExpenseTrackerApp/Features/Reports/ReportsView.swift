import SwiftUI
import Charts

struct ReportsView: View {
    @StateObject private var viewModel = ReportsViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.yearlyReport.isEmpty {
                LoadingView()
            } else if let error = viewModel.error, viewModel.yearlyReport.isEmpty {
                ErrorView(message: error, onRetry: { Task { await viewModel.load() } })
            } else {
                content
            }
        }
        .navigationTitle("Reports")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Picker("Year", selection: $viewModel.selectedYear) {
                    let current = Calendar.current.component(.year, from: .now)
                    ForEach((current - 4)...current, id: \.self) { year in
                        Text(String(year)).tag(year)
                    }
                }
                .onChange(of: viewModel.selectedYear) { _, _ in
                    Task { await viewModel.load() }
                }
            }
        }
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
    }

    private var content: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {

                // Year summary cards
                if let s = viewModel.yearlySummary {
                    LazyVGrid(columns: [.init(.flexible()), .init(.flexible())], spacing: 12) {
                        SummaryCardView(title: "Total Income", amount: s.totalIncome, icon: "arrow.down.circle.fill", tint: .green)
                        SummaryCardView(title: "Total Expense", amount: s.totalExpense, icon: "arrow.up.circle.fill", tint: .red)
                        SummaryCardView(
                            title: "Net Balance",
                            amount: s.balance,
                            icon: "scalemass.fill",
                            tint: s.balance >= 0 ? .blue : .red
                        )
                        .gridCellColumns(2)
                    }
                    .padding(.horizontal)
                }

                // Chart
                VStack(alignment: .leading, spacing: 10) {
                    Text("Monthly Breakdown — \(viewModel.selectedYear)")
                        .font(.headline)
                        .padding(.horizontal)
                    if viewModel.yearlyReport.isEmpty {
                        Text("No data for \(viewModel.selectedYear)")
                            .foregroundStyle(.secondary)
                            .font(.subheadline)
                            .frame(height: 180)
                            .frame(maxWidth: .infinity)
                    } else {
                        BarChartView(data: viewModel.yearlyReport)
                            .frame(height: 240)
                            .padding(.horizontal)
                    }
                }

                // Monthly table
                if !viewModel.yearlyReport.isEmpty {
                    VStack(spacing: 0) {
                        monthlyTableHeader
                        ForEach(viewModel.yearlyReport) { item in
                            monthlyTableRow(item)
                            Divider().padding(.leading)
                        }
                    }
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
                    .padding(.horizontal)
                }

                Spacer(minLength: 20)
            }
            .padding(.vertical)
        }
    }

    private var monthlyTableHeader: some View {
        HStack {
            Text("Month").font(.caption.bold()).foregroundStyle(.secondary).frame(maxWidth: .infinity, alignment: .leading)
            Text("Income").font(.caption.bold()).foregroundStyle(.secondary).frame(maxWidth: .infinity, alignment: .trailing)
            Text("Expense").font(.caption.bold()).foregroundStyle(.secondary).frame(maxWidth: .infinity, alignment: .trailing)
            Text("Balance").font(.caption.bold()).foregroundStyle(.secondary).frame(maxWidth: .infinity, alignment: .trailing)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .background(Color(.systemFill))
    }

    private func monthlyTableRow(_ item: MonthlyReport) -> some View {
        HStack {
            Text(item.monthName)
                .font(.subheadline)
                .frame(maxWidth: .infinity, alignment: .leading)
            Text(item.totalIncome.currency)
                .font(.caption.monospacedDigit())
                .foregroundStyle(.green)
                .frame(maxWidth: .infinity, alignment: .trailing)
            Text(item.totalExpense.currency)
                .font(.caption.monospacedDigit())
                .foregroundStyle(.red)
                .frame(maxWidth: .infinity, alignment: .trailing)
            Text(item.balance.currency)
                .font(.caption.bold().monospacedDigit())
                .foregroundStyle(item.balance >= 0 ? .blue : .red)
                .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
    }
}

#Preview {
    NavigationStack { ReportsView() }
}
