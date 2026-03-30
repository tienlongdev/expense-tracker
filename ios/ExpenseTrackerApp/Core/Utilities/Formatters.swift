import Foundation
import SwiftUI

// MARK: - Currency Formatting
// Assumption: Primary currency is Vietnamese Dong (VND). Amounts are whole numbers;
// fractional digits are hidden if zero.

extension Double {
    /// Formats as a plain number with thousand separators, e.g. 1,500,000
    var formatted: String {
        let nf = NumberFormatter()
        nf.numberStyle = .decimal
        nf.maximumFractionDigits = 0
        nf.minimumFractionDigits = 0
        nf.groupingSeparator = ","
        nf.groupingSize = 3
        return nf.string(from: NSNumber(value: self)) ?? "\(Int(self))"
    }

    /// Formats with currency symbol, e.g. 1,500,000 ₫
    var currency: String {
        "\(formatted) ₫"
    }

    /// Returns a sign-prefixed currency string for income/expense display
    var signedCurrency: String {
        self >= 0 ? "+\(currency)" : "-\(abs(self).currency)"
    }
}

// MARK: - Date Formatting
// Backend returns ISO 8601 strings. We parse on demand for display only.

private let isoParserFull: DateFormatter = {
    let df = DateFormatter()
    df.locale = Locale(identifier: "en_US_POSIX")
    df.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
    return df
}()

private let isoParserWithMillis: DateFormatter = {
    let df = DateFormatter()
    df.locale = Locale(identifier: "en_US_POSIX")
    df.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS"
    return df
}()

private let isoParserDateOnly: DateFormatter = {
    let df = DateFormatter()
    df.locale = Locale(identifier: "en_US_POSIX")
    df.dateFormat = "yyyy-MM-dd"
    return df
}()

extension String {
    /// Parses an ISO 8601 date string from the backend
    var asDate: Date? {
        // Strip timezone suffix for uniform parsing
        let s = self.replacingOccurrences(of: "Z", with: "")
                    .replacingOccurrences(of: "+00:00", with: "")
        // Try with milliseconds, then without, then date-only
        return isoParserWithMillis.date(from: s)
            ?? isoParserFull.date(from: s)
            ?? isoParserDateOnly.date(from: self)
    }

    /// Formats as "Mar 15, 2024"
    var displayDate: String {
        guard let d = asDate else { return self }
        let df = DateFormatter()
        df.dateStyle = .medium
        df.timeStyle = .none
        return df.string(from: d)
    }

    /// Formats as "Mar 15"
    var shortDate: String {
        guard let d = asDate else { return self }
        let df = DateFormatter()
        df.dateFormat = "MMM d"
        return df.string(from: d)
    }

    /// Formats as "15/03/2024"
    var numericDate: String {
        guard let d = asDate else { return self }
        let df = DateFormatter()
        df.dateFormat = "dd/MM/yyyy"
        return df.string(from: d)
    }

    /// Formats as relative time, e.g. "2 hours ago"
    var relativeTime: String {
        guard let d = asDate else { return self }
        let rf = RelativeDateTimeFormatter()
        rf.unitsStyle = .abbreviated
        return rf.localizedString(for: d, relativeTo: Date())
    }
}

// MARK: - Date → API String

extension Date {
    /// Converts to ISO 8601 date-only string for API payloads, e.g. "2024-03-15"
    var apiDateString: String {
        isoParserDateOnly.string(from: self)
    }

    /// Converts to ISO 8601 full string for API payloads
    var apiDateTimeString: String {
        isoParserFull.string(from: self)
    }
}

// MARK: - Color from Hex

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Month / Year Helpers

extension Calendar {
    static var monthNames: [String] {
        DateFormatter().monthSymbols ?? []
    }
}
