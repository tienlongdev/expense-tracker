import Foundation

// MARK: - Budget CRUD Record (from GET /api/budget)

struct BudgetRecord: Codable, Identifiable {
    let id: String
    let categoryId: String
    let categoryName: String
    let year: Int
    let month: Int
    let plannedAmount: Double
    let note: String?
}

// MARK: - Budget Status (per-category item in overview)

struct BudgetStatus: Codable, Identifiable {
    var id: String { categoryId }
    let categoryId: String
    let categoryName: String
    let categoryIcon: String?
    let categoryColor: String?
    let budgetId: String?
    let hasBudget: Bool
    let plannedAmount: Double
    let spentAmount: Double
    let remainingAmount: Double
    let usedPercent: Double
    let isOverBudget: Bool
    let isNearLimit: Bool
    let isNoBudget: Bool
}

// MARK: - Monthly Budget Overview (from GET /api/budget/overview)

struct BudgetOverview: Codable {
    let year: Int
    let month: Int
    let monthName: String?
    let totalPlanned: Double
    let totalSpent: Double
    let totalRemaining: Double
    let usedPercent: Double
    let overBudgetCount: Int
    let nearLimitCount: Int
    let onTrackCount: Int
    let noBudgetCount: Int
    let categories: [BudgetStatus]
}

// MARK: - Yearly Budget Summary (from GET /api/budget/overview/yearly)

struct MonthlyBudgetSummary: Codable, Identifiable {
    var id: Int { month }
    let month: Int
    let totalPlanned: Double
    let totalSpent: Double
    let totalRemaining: Double
    let usedPercent: Double
}

// MARK: - Request Models

struct CreateBudgetRequest: Codable {
    let categoryId: String
    let year: Int
    let month: Int
    let plannedAmount: Double
    let note: String?
}

struct UpdateBudgetRequest: Codable {
    let plannedAmount: Double
    let note: String?
}

struct CopyBudgetRequest: Codable {
    let sourceYear: Int
    let sourceMonth: Int
    let targetYear: Int
    let targetMonth: Int
    let overwrite: Bool
}

struct CopyBudgetResponse: Codable {
    let message: String?
    let created: Int
    let skipped: Int
    let overwritten: Int
}
