import SwiftUI

// MARK: - Brand Gradients

enum AppGradient {
    static let income = LinearGradient(
        colors: [Color(hex: "#00C897"), Color(hex: "#00A86B")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    static let expense = LinearGradient(
        colors: [Color(hex: "#FF6B6B"), Color(hex: "#EE2A7B")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    static let balance = LinearGradient(
        colors: [Color(hex: "#667EEA"), Color(hex: "#764BA2")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    static let primary = LinearGradient(
        colors: [Color(hex: "#6C63FF"), Color(hex: "#3F3D9F")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    static let card = LinearGradient(
        colors: [Color(hex: "#141428"), Color(hex: "#1E1E3A")],
        startPoint: .top, endPoint: .bottom
    )
}

// MARK: - Colors

extension Color {
    static let appBackground    = Color(hex: "#0D0D1A")
    static let cardBackground   = Color(hex: "#16162A")
    static let surfaceColor     = Color(hex: "#1E1E35")
    static let borderColor      = Color(hex: "#2A2A45")
    static let incomeGreen      = Color(hex: "#00C897")
    static let expenseRed       = Color(hex: "#FF6B6B")
    static let accentPurple     = Color(hex: "#6C63FF")
    static let textPrimary      = Color.white
    static let textSecondary    = Color(white: 1, opacity: 0.6)
    static let textTertiary     = Color(white: 1, opacity: 0.35)
}

// MARK: - Card Modifier

struct GlassCard: ViewModifier {
    var cornerRadius: CGFloat = 16

    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(Color.cardBackground)
                    .overlay(
                        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                            .stroke(Color.borderColor, lineWidth: 0.5)
                    )
            )
    }
}

extension View {
    func glassCard(cornerRadius: CGFloat = 16) -> some View {
        modifier(GlassCard(cornerRadius: cornerRadius))
    }
}

// MARK: - Gradient Summary Card

struct GradientSummaryCard: View {
    let title: String
    let amount: Double
    let icon: String
    let gradient: LinearGradient
    var isFullWidth: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.white.opacity(0.9))
                    .padding(8)
                    .background(.white.opacity(0.15), in: Circle())
                Spacer()
            }
            Text(amount.currency)
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
                .lineLimit(1)
                .minimumScaleFactor(0.6)
            Text(title)
                .font(.caption.weight(.medium))
                .foregroundStyle(.white.opacity(0.75))
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(gradient)
                .shadow(color: .black.opacity(0.3), radius: 10, y: 4)
        )
    }
}

// MARK: - Section Header

struct SectionHeader: View {
    let title: String
    var action: (() -> Void)? = nil
    var actionTitle: String = ""

    var body: some View {
        HStack {
            Text(title)
                .font(.headline.weight(.semibold))
                .foregroundStyle(Color.textPrimary)
            Spacer()
            if let action {
                Button(actionTitle, action: action)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Color.accentPurple)
            }
        }
    }
}

// MARK: - Empty State

struct MinimalEmptyState: View {
    let icon: String
    let title: String
    let subtitle: String
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 48, weight: .light))
                .foregroundStyle(Color.textTertiary)
            VStack(spacing: 6) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(Color.textSecondary)
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(Color.textTertiary)
                    .multilineTextAlignment(.center)
            }
            if let actionTitle, let action {
                Button(action: action) {
                    Text(actionTitle)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 10)
                        .background(AppGradient.primary, in: Capsule())
                }
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity)
    }
}
