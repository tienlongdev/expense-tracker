import SwiftUI

enum AppGradient {
    static let primary = LinearGradient(
        colors: [Color.accentPurple, Color.accentPurple.opacity(0.72)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let income = LinearGradient(
        colors: [Color.incomeGreen, Color.incomeGreen.opacity(0.72)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let expense = LinearGradient(
        colors: [Color.expenseRed, Color.expenseRed.opacity(0.72)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let balance = LinearGradient(
        colors: [Color(hex: "#22C55E"), Color(hex: "#06B6D4")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

extension Color {
    static let appBackground = Color(hex: "#0B1020")
    static let cardBackground = Color(hex: "#141A2E")
    static let textPrimary = Color(hex: "#F8FAFC")
    static let textSecondary = Color(hex: "#94A3B8")
    static let textTertiary = Color(hex: "#64748B")
    static let borderColor = Color.white.opacity(0.10)
    static let accentPurple = Color(hex: "#7C3AED")
    static let incomeGreen = Color(hex: "#22C55E")
    static let expenseRed = Color(hex: "#EF4444")
}

extension View {
    func glassCard(cornerRadius: CGFloat = 20) -> some View {
        self
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(Color.cardBackground.opacity(0.92))
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(Color.borderColor, lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.18), radius: 18, y: 8)
    }
}

struct SectionHeader: View {
    let title: String
    var action: (() -> Void)? = nil
    var actionTitle: String? = nil

    var body: some View {
        HStack(alignment: .center) {
            Text(title)
                .font(.headline.weight(.bold))
                .foregroundStyle(Color.textPrimary)

            Spacer()

            if let actionTitle, let action {
                Button(action: action) {
                    Text(actionTitle)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color.accentPurple)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

struct MinimalEmptyState: View {
    let icon: String
    let title: String
    let subtitle: String
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 32, weight: .light))
                .foregroundStyle(Color.textSecondary)

            VStack(spacing: 6) {
                Text(title)
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(Color.textPrimary)
                    .multilineTextAlignment(.center)

                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(Color.textSecondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(3)
            }

            if let actionTitle, let action {
                Button(action: action) {
                    Text(actionTitle)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 18)
                        .padding(.vertical, 10)
                        .background(AppGradient.primary, in: Capsule())
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 20)
        .padding(.vertical, 28)
    }
}

struct GradientSummaryCard: View {
    let title: String
    let amount: Double
    let icon: String
    let gradient: LinearGradient
    var isFullWidth: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.white.opacity(0.95))
                    .padding(9)
                    .background(.white.opacity(0.14), in: Circle())

                Spacer()
            }

            Text(amount.currency)
                .font(.title3.weight(.bold))
                .foregroundStyle(.white)
                .lineLimit(1)
                .minimumScaleFactor(0.75)

            Text(title)
                .font(.caption.weight(.medium))
                .foregroundStyle(.white.opacity(0.82))
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(gradient, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(Color.white.opacity(0.08), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.16), radius: 18, y: 8)
    }
}

#Preview {
    ZStack {
        Color.appBackground.ignoresSafeArea()

        VStack(spacing: 16) {
            SectionHeader(title: "Tổng quan", action: {}, actionTitle: "Xem thêm")
            GradientSummaryCard(
                title: "Thu nhập",
                amount: 12_500_000,
                icon: "arrow.down.circle.fill",
                gradient: AppGradient.income
            )
            MinimalEmptyState(
                icon: "tray",
                title: "Chưa có dữ liệu",
                subtitle: "Tạo bản ghi đầu tiên để bắt đầu"
            )
            .glassCard()
        }
        .padding()
    }
}
