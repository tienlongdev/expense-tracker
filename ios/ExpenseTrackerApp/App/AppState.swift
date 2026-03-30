import SwiftUI

// Shared app-level state (currently minimal since there is no auth).
// Holds notification badge count so the Dashboard tab can show it in the nav bar.
@MainActor
final class AppState: ObservableObject {
    @Published var unreadNotificationCount: Int = 0

    private let client = APIClient.shared

    func refreshUnreadCount() async {
        do {
            let response: UnreadCountResponse = try await client.get("/api/notification/unread-count")
            unreadNotificationCount = response.count
        } catch {
            // Non-critical — badge count failure should not interrupt the user
        }
    }
}
