import Foundation

@MainActor
final class TransactionsViewModel: ObservableObject {
    @Published var transactions: [Transaction] = []
    @Published var isLoading = false
    @Published var isLoadingMore = false
    @Published var error: String?
    @Published var hasMore = false

    // Filter state
    @Published var filterTitle: String = ""
    @Published var filterType: TransactionType? = nil
    @Published var filterFromDate: Date? = nil
    @Published var filterToDate: Date? = nil

    private var currentPage = 1
    private let pageSize = 20
    private let client = APIClient.shared

    var isFiltered: Bool {
        !filterTitle.isEmpty || filterType != nil || filterFromDate != nil || filterToDate != nil
    }

    // MARK: - Load

    func load() async {
        currentPage = 1
        isLoading = true
        error = nil
        do {
            let result: PagedResult<Transaction> = try await client.get(
                "/api/transaction",
                queryItems: buildQuery(page: 1)
            )
            transactions = result.items
            hasMore = result.page < result.totalPages
            currentPage = 1
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func loadMore() async {
        guard !isLoadingMore, hasMore else { return }
        let nextPage = currentPage + 1
        isLoadingMore = true
        do {
            let result: PagedResult<Transaction> = try await client.get(
                "/api/transaction",
                queryItems: buildQuery(page: nextPage)
            )
            transactions.append(contentsOf: result.items)
            hasMore = result.page < result.totalPages
            currentPage = nextPage
        } catch {
            self.error = error.localizedDescription
        }
        isLoadingMore = false
    }

    func applyFilters() async {
        await load()
    }

    func clearFilters() async {
        filterTitle = ""
        filterType = nil
        filterFromDate = nil
        filterToDate = nil
        await load()
    }

    // MARK: - Mutations

    func delete(id: String) async {
        do {
            try await client.delete("/api/transaction/\(id)")
            transactions.removeAll { $0.id == id }
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: - Private

    private func buildQuery(page: Int) -> [URLQueryItem] {
        var items: [URLQueryItem] = [
            .init(name: "page", value: "\(page)"),
            .init(name: "pageSize", value: "\(pageSize)")
        ]
        if !filterTitle.isEmpty {
            items.append(.init(name: "title", value: filterTitle))
        }
        if let type = filterType {
            items.append(.init(name: "type", value: "\(type.rawValue)"))
        }
        if let from = filterFromDate {
            items.append(.init(name: "fromDate", value: from.apiDateString))
        }
        if let to = filterToDate {
            items.append(.init(name: "toDate", value: to.apiDateString))
        }
        return items
    }
}
