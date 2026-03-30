import SwiftUI

struct MoreView: View {
    var body: some View {
        List {
            Section("Finance") {
                NavigationLink {
                    SavingsView()
                } label: {
                    Label("Savings & Investments", systemImage: "banknote.fill")
                }
            }

            Section("Analysis") {
                NavigationLink {
                    ReportsView()
                } label: {
                    Label("Reports", systemImage: "chart.bar.xaxis")
                }
            }

            Section("Settings") {
                NavigationLink {
                    CategoriesView()
                } label: {
                    Label("Categories", systemImage: "tag.fill")
                }
                NavigationLink {
                    NotificationsView()
                } label: {
                    Label("Notifications", systemImage: "bell.fill")
                }
            }

            Section {
                // Assumption: No auth system; this section is a placeholder for
                // future user account management if authentication is added.
                HStack {
                    Image(systemName: "info.circle.fill")
                        .foregroundStyle(.secondary)
                    Text("Expense Tracker  •  v1.0")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .navigationTitle("More")
    }
}

#Preview {
    NavigationStack { MoreView() }
}
