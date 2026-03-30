import Foundation

@MainActor
final class CategoriesViewModel: ObservableObject {
    @Published var categories: [Category] = []
    @Published var isLoading = false
    @Published var error: String?
    @Published var selectedType: TransactionType? = nil

    private let client = APIClient.shared

    var displayedCategories: [Category] {
        if let t = selectedType {
            return categories.filter { $0.type == t }
        }
        return categories
    }

    func load() async {
        isLoading = true
        error = nil
        do {
            categories = try await client.get("/api/category")
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func delete(id: String) async {
        do {
            try await client.delete("/api/category/\(id)")
            categories.removeAll { $0.id == id }
        } catch {
            self.error = error.localizedDescription
        }
    }
}
