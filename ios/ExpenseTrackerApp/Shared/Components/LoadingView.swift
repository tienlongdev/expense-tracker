import SwiftUI

struct LoadingView: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .tint(Color.accentPurple)
                .scaleEffect(1.3)
            Text("Đang tải...")
                .font(.subheadline)
                .foregroundStyle(Color.textSecondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview {
    ZStack {
        Color.appBackground.ignoresSafeArea()
        LoadingView()
    }
}
