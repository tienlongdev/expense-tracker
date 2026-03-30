import SwiftUI

struct MonthYearPicker: View {
    @Binding var year: Int
    @Binding var month: Int

    private let monthNames = DateFormatter().monthSymbols ?? []
    private let currentYear = Calendar.current.component(.year, from: .now)

    var body: some View {
        HStack(spacing: 4) {
            Button {
                step(by: -1)
            } label: {
                Image(systemName: "chevron.left")
                    .font(.subheadline.bold())
            }
            .buttonStyle(.plain)

            Text(label)
                .font(.headline)
                .frame(minWidth: 140)

            Button {
                step(by: 1)
            } label: {
                Image(systemName: "chevron.right")
                    .font(.subheadline.bold())
            }
            .buttonStyle(.plain)
        }
    }

    private var label: String {
        guard month >= 1, month <= 12 else { return "\(year)" }
        return "\(monthNames[month - 1]) \(year)"
    }

    private func step(by delta: Int) {
        var m = month + delta
        var y = year
        if m < 1 { m = 12; y -= 1 }
        if m > 12 { m = 1; y += 1 }
        month = m
        year = y
    }
}

#Preview {
    @Previewable @State var year = 2024
    @Previewable @State var month = 3
    MonthYearPicker(year: $year, month: $month)
        .padding()
}
