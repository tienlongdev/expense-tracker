import Foundation

// MARK: - Enum
// Named AppNotification to avoid conflict with Foundation.Notification

enum AppNotificationType: Int, Codable {
    case budgetAlert = 1
    case salaryReceived = 2
    case weeklySummary = 3

    var displayName: String {
        switch self {
        case .budgetAlert: return "Budget Alert"
        case .salaryReceived: return "Salary Received"
        case .weeklySummary: return "Weekly Summary"
        }
    }

    var sfSymbol: String {
        switch self {
        case .budgetAlert: return "exclamationmark.circle.fill"
        case .salaryReceived: return "dollarsign.circle.fill"
        case .weeklySummary: return "calendar.circle.fill"
        }
    }
}

// MARK: - Response Model

struct AppNotification: Codable, Identifiable {
    let id: String
    let type: AppNotificationType
    let title: String
    let message: String
    let isRead: Bool
    let createdAt: String
}

struct UnreadCountResponse: Codable {
    let count: Int
}
