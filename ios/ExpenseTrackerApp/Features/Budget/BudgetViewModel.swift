import Foundation

@MainActor
final class BudgetViewModel: ObservableObject {
    @Published var overview: BudgetOverview?
    @Published var isLoading = false
    @Published var isSaving = false
    @Published var error: String?

    @Published var year: Int = Calendar.current.component(.year, from: .now)
    @Published var month: Int = Calendar.current.component(.month, from: .now)

    // For form sheets — hold the budget record being edited
    @Published var editingBudget: BudgetRecord? = nil

    private let client = APIClient.shared

    // MARK: - Load

    func load() async {
        isLoading = true
        error = nil
        do {
            let result: BudgetOverview = try await client.get(
                "/api/budget/overview",
                queryItems: [
                    .init(name: "year", value: "\(year)"),
                    .init(name: "month", value: "\(month)")
                ]
            )
            overview = result
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    // MARK: - Delete

    func deleteBudget(id: String) async {
        do {
            try await client.delete("/api/budget/\(id)")
            await load()
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: - Copy from previous month

    func copyFromPreviousMonth() async {
        var srcMonth = month - 1
        var srcYear = year
        if srcMonth < 1 { srcMonth = 12; srcYear -= 1 }

        let body = CopyBudgetRequest(
            sourceYear: srcYear,
            sourceMonth: srcMonth,
            targetYear: year,
            targetMonth: month,
            overwrite: false
        )
        isSaving = true
        error = nil
        do {
            let _: CopyBudgetResponse = try await client.post("/api/budget/copy", body: body)
            await load()
        } catch {
            self.error = error.localizedDescription
        }
        isSaving = false
    }

    // MARK: - Resolve BudgetRecord for editing by categoryId

    func fetchBudgetRecord(budgetId: String) async -> BudgetRecord? {
        do {
            let record: BudgetRecord = try await client.get("/api/budget/\(budgetId)")
            return record
        } catch {
            return nil
        }
    }
}
