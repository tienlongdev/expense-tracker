import Foundation

// MARK: - Response Model
// Gap: The /api/category endpoint TypeScript interface does not include `icon` or `color`.
// They are included here as optional fields; if the backend CategoryDto does not return
// them, the properties will be nil without causing a decode error.

struct Category: Codable, Identifiable {
    let id: String
    let name: String
    let type: TransactionType
    let typeName: String
    let icon: String?       // emoji or short text identifier
    let color: String?      // hex color string, e.g. "#FF5733"
    let isDefault: Bool?    // default categories cannot be deleted
    let createdAt: String?
    let updatedAt: String?
}

// MARK: - Request Models

struct CreateCategoryRequest: Codable {
    let name: String
    let type: Int
}

struct UpdateCategoryRequest: Codable {
    let name: String
    let type: Int
}
