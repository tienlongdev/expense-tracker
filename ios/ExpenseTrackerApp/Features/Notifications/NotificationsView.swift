import SwiftUI

struct NotificationsView: View {
    @StateObject private var viewModel = NotificationsViewModel()
    @EnvironmentObject private var appState: AppState
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.notifications.isEmpty {
                LoadingView()
            } else {
                listContent
            }
        }
        .navigationTitle("Notifications")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar { toolbarContent }
        .task {
            await viewModel.load()
            await appState.refreshUnreadCount()
        }
        .refreshable {
            await viewModel.load()
            await appState.refreshUnreadCount()
        }
    }

    // MARK: - Toolbar

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button("Done") { dismiss() }
        }
        ToolbarItem(placement: .topBarTrailing) {
            if viewModel.unreadCount > 0 {
                Button("Mark All Read") {
                    Task {
                        await viewModel.markAllRead()
                        await appState.refreshUnreadCount()
                    }
                }
                .font(.subheadline)
            }
        }
    }

    // MARK: - List

    private var listContent: some View {
        VStack(spacing: 0) {
            // Unread filter toggle
            Toggle("Show unread only", isOn: $viewModel.showUnreadOnly)
                .font(.subheadline)
                .padding(.horizontal)
                .padding(.vertical, 8)
                .onChange(of: viewModel.showUnreadOnly) { _, _ in
                    Task { await viewModel.load() }
                }

            Divider()

            if viewModel.displayedNotifications.isEmpty {
                EmptyStateView(
                    icon: "bell.slash",
                    title: "No Notifications",
                    subtitle: viewModel.showUnreadOnly ? "All caught up!" : "You have no notifications."
                )
            } else {
                List {
                    ForEach(viewModel.displayedNotifications) { n in
                        NotificationRowView(notification: n)
                            .contentShape(Rectangle())
                            .onTapGesture {
                                if !n.isRead {
                                    Task {
                                        await viewModel.markRead(id: n.id)
                                        await appState.refreshUnreadCount()
                                    }
                                }
                            }
                            .swipeActions(edge: .leading) {
                                if !n.isRead {
                                    Button {
                                        Task {
                                            await viewModel.markRead(id: n.id)
                                            await appState.refreshUnreadCount()
                                        }
                                    } label: {
                                        Label("Mark Read", systemImage: "checkmark.circle")
                                    }
                                    .tint(.blue)
                                }
                            }
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                Button(role: .destructive) {
                                    Task { await viewModel.delete(id: n.id) }
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }
                            }
                    }
                }
                .listStyle(.plain)
            }
        }
    }
}

// MARK: - Row

private struct NotificationRowView: View {
    let notification: AppNotification

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: notification.type.sfSymbol)
                .font(.title3)
                .foregroundStyle(typeColor)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(notification.title)
                        .font(.subheadline.weight(notification.isRead ? .regular : .semibold))
                        .lineLimit(1)
                    Spacer()
                    Text(notification.createdAt.relativeTime)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
                Text(notification.message)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(3)
            }

            if !notification.isRead {
                Circle()
                    .fill(.blue)
                    .frame(width: 8, height: 8)
                    .padding(.top, 4)
            }
        }
        .padding(.vertical, 4)
        .opacity(notification.isRead ? 0.7 : 1.0)
    }

    private var typeColor: Color {
        switch notification.type {
        case .budgetAlert: return .orange
        case .salaryReceived: return .green
        case .weeklySummary: return .blue
        }
    }
}

#Preview {
    NavigationStack {
        NotificationsView()
            .environmentObject(AppState())
    }
}
