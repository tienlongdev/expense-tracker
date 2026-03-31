import Foundation

// MARK: - Enums

enum DebtType: Int, Codable, CaseIterable {
    case borrowed = 1
    case lent = 2

    var displayName: String {
        switch self {
        case .borrowed: return "Đang vay"
        case .lent: return "Đã cho vay"
        }
    }
}

enum DebtStatus: Int, Codable, CaseIterable {
    case unpaid = 1
    case partiallyPaid = 2
    case paid = 3

    var displayName: String {
        switch self {
        case .unpaid: return "Chưa thanh toán"
        case .partiallyPaid: return "Thanh toán một phần"
        case .paid: return "Đã thanh toán"
        }
    }
}

// MARK: - Response Models

struct Debt: Codable, Identifiable {
    let id: String
    let title: String
    let personName: String
    let originalAmount: Double
    let remainingAmount: Double
    let paidAmount: Double
    let type: DebtType
    let typeName: String
    let status: DebtStatus
    let statusName: String
    let dueDate: String?
    let note: String?
    let createdAt: String

    var isOverdue: Bool {
        guard let due = dueDate?.asDate, status != .paid else { return false }
        return due < Date()
    }
}

struct DebtPayment: Codable, Identifiable {
    let id: String
    let debtId: String
    let amount: Double
    let paidDate: String
    let note: String?
    let createdAt: String?
}

struct DebtSummary: Codable {
    let totalBorrowed: Double
    let totalLent: Double
    let totalBorrowedRemaining: Double
    let totalLentRemaining: Double
    let overdueCount: Int
}

// MARK: - Request Models

struct CreateDebtRequest: Codable {
    let title: String
    let personName: String
    let originalAmount: Double
    let type: Int
    let dueDate: String?
    let note: String?
}

struct UpdateDebtRequest: Codable {
    let title: String
    let personName: String
    let dueDate: String?
    let note: String?
}

struct CreateDebtPaymentRequest: Codable {
    let amount: Double
    let paidDate: String
    let note: String?
}
