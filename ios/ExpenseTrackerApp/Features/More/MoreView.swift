import SwiftUI

struct MoreView: View {
    var body: some View {
        ZStack {
            Color.appBackground.ignoresSafeArea()

            List {
                Section {
                    NavigationLink {
                        SavingsView()
                    } label: {
                        menuRow(icon: "banknote.fill", title: "Tiết kiệm & Đầu tư",
                                iconColor: Color.incomeGreen)
                    }
                } header: {
                    Text("TÀI CHÍNH")
                        .foregroundStyle(Color.textTertiary)
                        .font(.caption.weight(.semibold))
                }
                .listRowBackground(Color.cardBackground)

                Section {
                    NavigationLink {
                        ReportsView()
                    } label: {
                        menuRow(icon: "chart.bar.xaxis", title: "Báo cáo & Phân tích",
                                iconColor: Color.accentPurple)
                    }
                } header: {
                    Text("PHÂN TÍCH")
                        .foregroundStyle(Color.textTertiary)
                        .font(.caption.weight(.semibold))
                }
                .listRowBackground(Color.cardBackground)

                Section {
                    NavigationLink {
                        CategoriesView()
                    } label: {
                        menuRow(icon: "tag.fill", title: "Danh mục",
                                iconColor: .orange)
                    }
                    NavigationLink {
                        NotificationsView()
                    } label: {
                        menuRow(icon: "bell.fill", title: "Thông báo",
                                iconColor: Color.expenseRed)
                    }
                } header: {
                    Text("CÀI ĐẶT")
                        .foregroundStyle(Color.textTertiary)
                        .font(.caption.weight(.semibold))
                }
                .listRowBackground(Color.cardBackground)

                Section {
                    HStack {
                        Image(systemName: "info.circle.fill")
                            .foregroundStyle(Color.textTertiary)
                        Text("Quản lý chi tiêu  •  v1.0")
                            .font(.footnote)
                            .foregroundStyle(Color.textTertiary)
                    }
                    .listRowBackground(Color.cardBackground)
                }
            }
            .scrollContentBackground(.hidden)
        }
        .navigationTitle("Thêm")
        .navigationBarTitleDisplayMode(.large)
        .toolbarBackground(Color.appBackground, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }

    private func menuRow(icon: String, title: String, iconColor: Color) -> some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(iconColor.opacity(0.15))
                    .frame(width: 34, height: 34)
                Image(systemName: icon)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(iconColor)
            }
            Text(title)
                .font(.subheadline)
                .foregroundStyle(Color.textPrimary)
        }
    }
}

#Preview {
    NavigationStack { MoreView() }
}
