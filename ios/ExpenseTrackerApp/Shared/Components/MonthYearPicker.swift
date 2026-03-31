import SwiftUI

struct MonthYearPicker: View {
    @Binding var year: Int
    @Binding var month: Int

    private let monthNames: [String] = {
        let df = DateFormatter()
        df.locale = Locale(identifier: "vi_VN")
        return df.monthSymbols ?? []
    }()

    var body: some View {
        HStack(spacing: 8) {
            Button {
                step(by: -1)
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(Color.textSecondary)
                    .padding(8)
                    .background(Color.surfaceColor, in: Circle())
            }
            .buttonStyle(.plain)

            Text(label)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Color.textPrimary)
                .frame(minWidth: 130)
                .padding(.horizontal, 12)
                .padding(.vertical, 7)
                .background(Color.surfaceColor, in: Capsule())

            Button {
                step(by: 1)
            } label: {
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(Color.textSecondary)
                    .padding(8)
                    .background(Color.surfaceColor, in: Circle())
            }
            .buttonStyle(.plain)
        }
    }

    private var label: String {
        guard month >= 1, month <= monthNames.count else { return "\(year)" }
        let monthName = monthNames[month - 1].capitalized
        return "Th. \(month) \(year)"
    }

    private func step(by delta: Int) {
        var m = month + delta
        var y = year
        if m < 1 { m = 12; y -= 1 }
        if m > 12 { m = 1; y += 1 }
        withAnimation(.spring(response: 0.3)) {
            month = m
            year = y
        }
    }
}

#Preview {
    @Previewable @State var year = 2026
    @Previewable @State var month = 3
    ZStack {
        Color.appBackground.ignoresSafeArea()
        MonthYearPicker(year: $year, month: $month)
            .padding()
    }
}
