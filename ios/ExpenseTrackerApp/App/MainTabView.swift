import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }

            NavigationStack {
                TransactionsView()
            }
            .tabItem {
                Label("Transactions", systemImage: "list.bullet.rectangle.fill")
            }

            NavigationStack {
                BudgetView()
            }
            .tabItem {
                Label("Budget", systemImage: "chart.bar.fill")
            }

            NavigationStack {
                DebtView()
            }
            .tabItem {
                Label("Debt", systemImage: "creditcard.fill")
            }

            NavigationStack {
                MoreView()
            }
            .tabItem {
                Label("More", systemImage: "ellipsis.circle.fill")
            }
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AppState())
}
