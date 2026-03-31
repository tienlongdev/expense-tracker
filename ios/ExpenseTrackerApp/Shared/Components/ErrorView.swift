import SwiftUI

struct ErrorView: View {
    let message: String
    var retryTitle: String = "Thử lại"
    var onRetry: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: 20) {
            ZStack {
                Circle()
                    .fill(Color.orange.opacity(0.12))
                    .frame(width: 72, height: 72)
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 30))
                    .foregroundStyle(.orange)
            }

            VStack(spacing: 8) {
                Text("Có lỗi xảy ra")
                    .font(.headline.weight(.bold))
                    .foregroundStyle(Color.textPrimary)
                Text(message)
                    .font(.subheadline)
                    .foregroundStyle(Color.textSecondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
            }

            if let onRetry {
                Button(action: onRetry) {
                    Text(retryTitle)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 28)
                        .padding(.vertical, 12)
                        .background(AppGradient.primary, in: Capsule())
                }
            }
        }
        .padding(32)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview {
    ZStack {
        Color.appBackground.ignoresSafeArea()
        ErrorView(message: "Không thể kết nối đến máy chủ.", onRetry: {})
    }
}
