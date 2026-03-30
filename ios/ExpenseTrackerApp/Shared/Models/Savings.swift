import Foundation

// MARK: - Enums

enum SavingsType: Int, Codable, CaseIterable {
    case savings = 1
    case stock = 2
    case gold = 3
    case crypto = 4
    case realEstate = 5
    case fund = 6
    case other = 7

    var displayName: String {
        switch self {
        case .savings: return "Savings"
        case .stock: return "Stocks"
        case .gold: return "Gold"
        case .crypto: return "Crypto"
        case .realEstate: return "Real Estate"
        case .fund: return "Investment Fund"
        case .other: return "Other"
        }
    }

    var sfSymbol: String {
        switch self {
        case .savings: return "banknote.fill"
        case .stock: return "chart.line.uptrend.xyaxis"
        case .gold: return "star.fill"
        case .crypto: return "bitcoinsign.circle.fill"
        case .realEstate: return "house.fill"
        case .fund: return "chart.pie.fill"
        case .other: return "creditcard.fill"
        }
    }
}

enum SavingsStatus: Int, Codable, CaseIterable {
    case active = 1
    case matured = 2
    case closed = 3

    var displayName: String {
        switch self {
        case .active: return "Active"
        case .matured: return "Matured"
        case .closed: return "Closed"
        }
    }
}

// MARK: - Response Models

struct SavingsAccount: Codable, Identifiable {
    let id: String
    let name: String
    let type: SavingsType
    let typeName: String
    let status: SavingsStatus
    let statusName: String
    let totalDeposited: Double
    let currentValue: Double
    let profitLoss: Double
    let interestRate: Double?
    let startDate: String
    let maturityDate: String?
    let note: String?
    let createdAt: String

    var isProfit: Bool { profitLoss >= 0 }
}

struct SavingsHistory: Codable, Identifiable {
    let id: String
    let savingsAccountId: String
    let transactionType: Int     // Gap: int values undocumented; use transactionTypeName for display
    let transactionTypeName: String
    let amount: Double
    let previousValue: Double
    let newValue: Double
    let profitLoss: Double
    let note: String?
    let date: String
    let createdAt: String?
}

struct SavingsSummary: Codable {
    let totalDeposited: Double
    let totalCurrentValue: Double
    let totalProfitLoss: Double
    let totalProfitPercent: Double
    let activeCount: Int
    let maturedCount: Int
    let closedCount: Int
}

// MARK: - Request Models

struct CreateSavingsAccountRequest: Codable {
    let name: String
    let type: Int
    let initialAmount: Double
    let interestRate: Double?
    let startDate: String
    let maturityDate: String?
    let note: String?
}

struct UpdateSavingsAccountRequest: Codable {
    let name: String
    let type: Int
    let interestRate: Double?
    let maturityDate: String?
    let note: String?
}

struct SavingsDepositRequest: Codable {
    let amount: Double
    let date: String
    let note: String?
}

struct SavingsWithdrawRequest: Codable {
    let amount: Double
    let date: String
    let note: String?
}

struct UpdateSavingsValueRequest: Codable {
    let newValue: Double
    let date: String
    let note: String?
}

struct SavingsInterestRequest: Codable {
    let amount: Double
    let date: String
    let note: String?
}

struct CloseAccountRequest: Codable {
    let note: String?
}
