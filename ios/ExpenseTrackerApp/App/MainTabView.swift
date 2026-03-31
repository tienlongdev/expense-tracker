import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var appState: AppState

    init() {
        // Dark tab bar appearance
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(Color(hex: "#0D0D1A"))
        appearance.shadowColor = UIColor(Color(hex: "#2A2A45"))

        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
        UITabBar.appearance().tintColor = UIColor(Color(hex: "#6C63FF"))
        UITabBar.appearance().unselectedItemTintColor = UIColor.white.withAlphaComponent(0.4)
    }

    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label("Tổng quan", systemImage: "house.fill")
                }

            NavigationStack {
                TransactionsView()
            }
            .tabItem {
                Label("Giao dịch", systemImage: "list.bullet.rectangle.fill")
            }

            NavigationStack {
                BudgetView()
            }
            .tabItem {
                Label("Ngân sách", systemImage: "chart.bar.fill")
            }

            NavigationStack {
                DebtView()
            }
            .tabItem {
                Label("Nợ", systemImage: "creditcard.fill")
            }

            NavigationStack {
                MoreView()
            }
            .tabItem {
                Label("Thêm", systemImage: "ellipsis.circle.fill")
            }
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AppState())
}
