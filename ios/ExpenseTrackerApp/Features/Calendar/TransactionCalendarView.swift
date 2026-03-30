import SwiftUI

struct TransactionCalendarView: View {
    @StateObject private var viewModel = TransactionCalendarViewModel()
    @Environment(\.dismiss) private var dismiss

    private let cal = Calendar.current
    private let columns = Array(repeating: GridItem(.flexible()), count: 7)
    private let weekdaySymbols = Calendar.current.veryShortWeekdaySymbols

    var body: some View {
        VStack(spacing: 0) {
            // Month/Year picker
            HStack {
                MonthYearPicker(year: $viewModel.year, month: $viewModel.month)
                    .onChange(of: viewModel.month) { _, _ in Task { await viewModel.load() } }
                    .onChange(of: viewModel.year) { _, _ in Task { await viewModel.load() } }
            }
            .padding()

            // Monthly summary strip
            HStack(spacing: 0) {
                miniSummaryCell(label: "Income", amount: viewModel.monthIncome, color: .green)
                Divider()
                miniSummaryCell(label: "Expense", amount: viewModel.monthExpense, color: .red)
                Divider()
                miniSummaryCell(label: "Balance", amount: viewModel.monthBalance, color: viewModel.monthBalance >= 0 ? .blue : .red)
            }
            .frame(height: 52)
            .background(.regularMaterial)

            Divider()

            // Weekday headers
            LazyVGrid(columns: columns, spacing: 0) {
                ForEach(Array(weekdaySymbols.enumerated()), id: \.offset) { _, sym in
                    Text(sym)
                        .font(.caption2.bold())
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 6)
                }
            }
            Divider()

            if viewModel.isLoading {
                LoadingView().frame(height: 260)
            } else {
                // Calendar grid
                LazyVGrid(columns: columns, spacing: 4) {
                    ForEach(calendarDays, id: \.self) { date in
                        if let date {
                            DayCellView(
                                date: date,
                                isSelected: viewModel.selectedDate.map { cal.isDate($0, inSameDayAs: date) } ?? false,
                                hasIncome: hasIncome(date),
                                hasExpense: hasExpense(date)
                            )
                            .onTapGesture {
                                viewModel.selectedDate = (viewModel.selectedDate.map { cal.isDate($0, inSameDayAs: date) } ?? false) ? nil : date
                            }
                        } else {
                            Color.clear.frame(height: 40)
                        }
                    }
                }
                .padding(.horizontal, 4)
            }

            Divider()

            // Selected day transactions
            dayTransactionList
        }
        .navigationTitle("Calendar")
        .navigationBarTitleDisplayMode(.inline)
        .task { await viewModel.load() }
    }

    // MARK: - Subviews

    private func miniSummaryCell(label: String, amount: Double, color: Color) -> some View {
        VStack(spacing: 2) {
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text(amount.currency)
                .font(.caption.bold())
                .foregroundStyle(color)
                .lineLimit(1)
                .minimumScaleFactor(0.6)
        }
        .frame(maxWidth: .infinity)
    }

    private var dayTransactionList: some View {
        Group {
            if let selected = viewModel.selectedDate {
                VStack(alignment: .leading, spacing: 0) {
                    Text(selected.displayDate)
                        .font(.subheadline.weight(.semibold))
                        .padding(.horizontal)
                        .padding(.top, 12)
                    if viewModel.selectedDayTransactions.isEmpty {
                        Text("No transactions")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .padding()
                    } else {
                        List(viewModel.selectedDayTransactions) { tx in
                            TransactionRowView(transaction: tx)
                        }
                        .listStyle(.plain)
                    }
                }
            } else {
                Text("Tap a day to see transactions")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding()
            }
        }
    }

    // MARK: - Calendar Logic

    private var calendarDays: [Date?] {
        guard let firstDay = firstDayOfMonth else { return [] }
        let weekdayOfFirst = cal.component(.weekday, from: firstDay) - cal.firstWeekday
        let offset = (weekdayOfFirst + 7) % 7
        let daysInMonth = cal.range(of: .day, in: .month, for: firstDay)?.count ?? 30

        var days: [Date?] = Array(repeating: nil, count: offset)
        for day in 1...daysInMonth {
            var comps = DateComponents()
            comps.year = viewModel.year
            comps.month = viewModel.month
            comps.day = day
            days.append(cal.date(from: comps))
        }
        return days
    }

    private var firstDayOfMonth: Date? {
        var comps = DateComponents()
        comps.year = viewModel.year
        comps.month = viewModel.month
        comps.day = 1
        return cal.date(from: comps)
    }

    private func dateKey(_ date: Date) -> String {
        let df = DateFormatter()
        df.dateFormat = "yyyy-MM-dd"
        return df.string(from: date)
    }

    private func hasIncome(_ date: Date) -> Bool { viewModel.incomeDates.contains(dateKey(date)) }
    private func hasExpense(_ date: Date) -> Bool { viewModel.expenseDates.contains(dateKey(date)) }
}

// MARK: - Day Cell

private struct DayCellView: View {
    let date: Date
    let isSelected: Bool
    let hasIncome: Bool
    let hasExpense: Bool

    private let cal = Calendar.current

    var body: some View {
        let isToday = cal.isDateInToday(date)
        let dayNum = cal.component(.day, from: date)

        VStack(spacing: 2) {
            ZStack {
                if isSelected {
                    Circle().fill(.blue).frame(width: 30, height: 30)
                } else if isToday {
                    Circle().strokeBorder(.blue, lineWidth: 1.5).frame(width: 30, height: 30)
                }
                Text("\(dayNum)")
                    .font(.subheadline)
                    .foregroundStyle(isSelected ? .white : (isToday ? .blue : .primary))
            }
            HStack(spacing: 3) {
                if hasIncome {
                    Circle().fill(.green).frame(width: 4, height: 4)
                }
                if hasExpense {
                    Circle().fill(.red).frame(width: 4, height: 4)
                }
            }
            .frame(height: 5)
        }
        .frame(height: 44)
    }
}

extension Date {
    var displayDate: String {
        let df = DateFormatter()
        df.dateStyle = .full
        df.timeStyle = .none
        return df.string(from: self)
    }
}

#Preview {
    NavigationStack {
        TransactionCalendarView()
    }
}
