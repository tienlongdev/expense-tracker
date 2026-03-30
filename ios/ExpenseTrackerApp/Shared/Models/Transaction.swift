import Foundation

// MARK: - Enum

enum TransactionType: Int, Codable, CaseIterable {
    case income = 1
    case expense = 2

    var displayName: String {
        switch self {
        case .income: return "Income"
        case .expense: return "Expense"
        }
    }

    var sfSymbol: String {
        switch self {
        case .income: return "arrow.down.circle.fill"
        case .expense: return "arrow.up.circle.fill"
        }
    }
}

// MARK: - Response Models

struct Transaction: Codable, Identifiable {
    let id: String
    let title: String
    let amount: Double
    let type: TransactionType
    let typeName: String
    let categoryId: String
    let categoryName: String
    let categoryIcon: String
    let categoryColor: String
    let date: String
    let note: String?
    let createdAt: String
    let updatedAt: String?
}

struct PagedResult<T: Codable>: Codable {
    let items: [T]
    let totalCount: Int
    let page: Int
    let pageSize: Int
    let totalPages: Int
}

struct SummaryDto: Codable {
    let totalIncome: Double
    let totalExpense: Double
    let balance: Double
}

// MARK: - Request Models

struct CreateTransactionRequest: Codable {
    let title: String
    let amount: Double
    let type: Int          // raw Int; TransactionType.rawValue
    let categoryId: String
    let date: String       // ISO date string
    let note: String?
}

struct UpdateTransactionRequest: Codable {
    let title: String
    let amount: Double
    let type: Int
    let categoryId: String
    let date: String
    let note: String?
}

// MARK: - Query

struct TransactionQuery {
    var page: Int = 1
    var pageSize: Int = 20
    var title: String = ""
    var fromDate: String?
    var toDate: String?
    var type: TransactionType?

    var queryItems: [URLQueryItem] {
        var items: [URLQueryItem] = [
            URLQueryItem(name: "page", value: "\(page)"),
            URLQueryItem(name: "pageSize", value: "\(pageSize)")
        ]
        if !title.isEmpty { items.append(.init(name: "title", value: title)) }
        if let f = fromDate { items.append(.init(name: "fromDate", value: f)) }
        if let t = toDate { items.append(.init(name: "toDate", value: t)) }
        if let type { items.append(.init(name: "type", value: "\(type.rawValue)")) }
        return items
    }
}
