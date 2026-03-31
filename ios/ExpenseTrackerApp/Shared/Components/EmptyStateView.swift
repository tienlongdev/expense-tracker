import SwiftUI

// Legacy empty state view - kept for Calendar and other views not yet refactored
struct EmptyStateView: View {
    let icon: String
    let title: String
    let subtitle: String
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil

    var body: some View {
        MinimalEmptyState(
            icon: icon,
            title: title,
            subtitle: subtitle,
            actionTitle: actionTitle,
            action: action
        )
    }
}

#Preview {
    ZStack {
        Color.appBackground.ignoresSafeArea()
        EmptyStateView(
            icon: "tray",
            title: "Chưa có dữ liệu",
            subtitle: "Nhấn + để thêm mục mới",
            actionTitle: "Thêm ngay",
            action: {}
        )
    }
}
