import Foundation

@MainActor
final class NotificationsViewModel: ObservableObject {
    @Published var notifications: [AppNotification] = []
    @Published var isLoading = false
    @Published var error: String?
    @Published var showUnreadOnly = false

    private let client = APIClient.shared

    var displayedNotifications: [AppNotification] {
        showUnreadOnly ? notifications.filter { !$0.isRead } : notifications
    }

    var unreadCount: Int { notifications.filter { !$0.isRead }.count }

    func load() async {
        isLoading = true
        error = nil
        do {
            var items: [URLQueryItem] = []
            if showUnreadOnly { items.append(.init(name: "onlyUnread", value: "true")) }
            notifications = try await client.get("/api/notification", queryItems: items)
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func markRead(id: String) async {
        do {
            try await client.patch("/api/notification/\(id)/read")
            if let idx = notifications.firstIndex(where: { $0.id == id }) {
                let old = notifications[idx]
                notifications[idx] = AppNotification(
                    id: old.id, type: old.type, title: old.title,
                    message: old.message, isRead: true, createdAt: old.createdAt
                )
            }
        } catch {
            self.error = error.localizedDescription
        }
    }

    func markAllRead() async {
        do {
            try await client.patch("/api/notification/read-all")
            notifications = notifications.map { n in
                AppNotification(id: n.id, type: n.type, title: n.title,
                                message: n.message, isRead: true, createdAt: n.createdAt)
            }
        } catch {
            self.error = error.localizedDescription
        }
    }

    func delete(id: String) async {
        do {
            try await client.delete("/api/notification/\(id)")
            notifications.removeAll { $0.id == id }
        } catch {
            self.error = error.localizedDescription
        }
    }
}
