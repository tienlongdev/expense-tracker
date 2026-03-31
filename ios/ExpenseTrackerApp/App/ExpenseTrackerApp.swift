import SwiftUI

@main
struct ExpenseTrackerApp: App {
    @StateObject private var appState = AppState()

    init() {
        // Force dark color scheme globally for consistent branding
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .forEach { $0.windows.forEach { $0.overrideUserInterfaceStyle = .dark } }
    }

    var body: some Scene {
        WindowGroup {
            MainTabView()
                .environmentObject(appState)
                .preferredColorScheme(.dark)
        }
    }
}
