import SwiftUI

struct TransactionFormView: View {
    @StateObject private var viewModel: TransactionFormViewModel
    @Environment(\.dismiss) private var dismiss

    init(transaction: Transaction?, onSave: @escaping () -> Void) {
        _viewModel = StateObject(wrappedValue: TransactionFormViewModel(
            transaction: transaction,
            onSave: onSave
        ))
    }

    var body: some View {
        ZStack {
            Color.appBackground.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    typePickerSection
                    detailsSection
                    categorySection
                    noteSection

                    if let error = viewModel.error {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                            Text(error)
                                .font(.subheadline)
                        }
                        .foregroundStyle(.red)
                        .padding(14)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.red.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
                    }

                    if viewModel.isEditing {
                        Button(role: .destructive) {
                            Task {
                                let deleted = await viewModel.delete()
                                if deleted { dismiss() }
                            }
                        } label: {
                            HStack {
                                Spacer()
                                Image(systemName: "trash")
                                Text("Xoá giao dịch")
                                    .font(.subheadline.weight(.semibold))
                                Spacer()
                            }
                            .foregroundStyle(.white)
                            .padding()
                            .background(Color.red.opacity(0.8), in: RoundedRectangle(cornerRadius: 14))
                        }
                    }
                }
                .padding(16)
            }
        }
        .navigationTitle(viewModel.isEditing ? "Sửa giao dịch" : "Giao dịch mới")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Color.cardBackground, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .toolbar { toolbarContent }
        .task { await viewModel.loadCategories() }
        .onChange(of: viewModel.selectedType) { _, _ in
            viewModel.selectedCategoryId = viewModel.filteredCategories.first?.id ?? ""
        }
    }

    // MARK: - Type Picker

    private var typePickerSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("LOẠI GIAO DỊCH")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.textTertiary)
                .padding(.leading, 2)

            HStack(spacing: 0) {
                ForEach(TransactionType.allCases, id: \.self) { type in
                    let isSelected = viewModel.selectedType == type
                    Button {
                        withAnimation(.spring(response: 0.3)) {
                            viewModel.selectedType = type
                        }
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: type.sfSymbol)
                                .font(.system(size: 14, weight: .semibold))
                            Text(type.displayName)
                                .font(.subheadline.weight(.semibold))
                        }
                        .foregroundStyle(isSelected ? .white : Color.textTertiary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background {
                            if isSelected {
                                Capsule()
                                    .fill(type == .income ? AppGradient.income : AppGradient.expense)
                                    .padding(4)
                            }
                        }
                    }
                }
            }
            .background(Color.surfaceColor, in: RoundedRectangle(cornerRadius: 14))
        }
    }

    // MARK: - Details

    private var detailsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("THÔNG TIN")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.textTertiary)
                .padding(.leading, 2)

            VStack(spacing: 0) {
                // Title
                HStack {
                    Image(systemName: "text.alignleft")
                        .foregroundStyle(Color.textTertiary)
                        .frame(width: 20)
                    TextField("Tên giao dịch", text: $viewModel.title)
                        .foregroundStyle(Color.textPrimary)
                        .autocorrectionDisabled()
                }
                .padding(14)

                Divider().background(Color.borderColor)

                // Amount
                HStack {
                    Image(systemName: "dong.sign")
                        .foregroundStyle(Color.textTertiary)
                        .frame(width: 20)
                    TextField("Số tiền", text: $viewModel.amount)
                        .foregroundStyle(Color.textPrimary)
                        .keyboardType(.decimalPad)
                        .onChange(of: viewModel.amount) { _, newValue in
                            let formatted = newValue.formattedAmount
                            if viewModel.amount != formatted {
                                viewModel.amount = formatted
                            }
                        }
                    Text("₫")
                        .foregroundStyle(Color.textSecondary)
                        .font(.subheadline.weight(.medium))
                }
                .padding(14)

                Divider().background(Color.borderColor)

                // Date
                DatePicker(
                    selection: $viewModel.date,
                    displayedComponents: .date
                ) {
                    HStack {
                        Image(systemName: "calendar")
                            .foregroundStyle(Color.textTertiary)
                            .frame(width: 20)
                        Text("Ngày")
                            .foregroundStyle(Color.textSecondary)
                    }
                }
                .foregroundStyle(Color.textPrimary)
                .colorScheme(.dark)
                .padding(14)
            }
            .background(Color.cardBackground, in: RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(Color.borderColor, lineWidth: 0.5)
            )
        }
    }

    // MARK: - Category

    private var categorySection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("DANH MỤC")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.textTertiary)
                .padding(.leading, 2)

            Group {
                if viewModel.isLoading {
                    HStack {
                        Spacer()
                        ProgressView()
                            .tint(Color.accentPurple)
                        Spacer()
                    }
                    .padding(20)
                    .glassCard()
                } else if viewModel.filteredCategories.isEmpty {
                    HStack {
                        Image(systemName: "tag.slash")
                            .foregroundStyle(Color.textTertiary)
                        Text("Không có danh mục phù hợp")
                            .font(.subheadline)
                            .foregroundStyle(Color.textSecondary)
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .glassCard()
                } else {
                    LazyVGrid(columns: [
                        .init(.flexible()),
                        .init(.flexible()),
                        .init(.flexible())
                    ], spacing: 8) {
                        ForEach(viewModel.filteredCategories) { cat in
                            categoryChip(cat)
                        }
                    }
                    .padding(12)
                    .glassCard()
                }
            }
        }
    }

    private func categoryChip(_ cat: Category) -> some View {
        let isSelected = viewModel.selectedCategoryId == cat.id
        return Button {
            withAnimation(.spring(response: 0.2)) {
                viewModel.selectedCategoryId = cat.id
            }
        } label: {
            VStack(spacing: 4) {
                Text(cat.icon ?? "📦")
                    .font(.system(size: 22))
                    .padding(8)
                    .background(
                        isSelected
                            ? (viewModel.selectedType == .income ? AppGradient.income : AppGradient.expense)
                            : LinearGradient(colors: [Color.surfaceColor], startPoint: .top, endPoint: .bottom),
                        in: Circle()
                    )
                Text(cat.name)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(isSelected ? Color.textPrimary : Color.textTertiary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 6)
            .animation(.spring(response: 0.2), value: isSelected)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Note

    private var noteSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("GHI CHÚ (tuỳ chọn)")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.textTertiary)
                .padding(.leading, 2)

            HStack(alignment: .top) {
                Image(systemName: "note.text")
                    .foregroundStyle(Color.textTertiary)
                    .frame(width: 20)
                    .padding(.top, 1)
                TextField("Thêm ghi chú...", text: $viewModel.note, axis: .vertical)
                    .foregroundStyle(Color.textPrimary)
                    .lineLimit(3, reservesSpace: true)
            }
            .padding(14)
            .background(Color.cardBackground, in: RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(Color.borderColor, lineWidth: 0.5)
            )
        }
    }

    // MARK: - Toolbar

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button("Huỷ") { dismiss() }
                .foregroundStyle(Color.textSecondary)
        }
        ToolbarItem(placement: .topBarTrailing) {
            if viewModel.isSaving {
                ProgressView()
                    .tint(Color.accentPurple)
            } else {
                Button {
                    Task {
                        let saved = await viewModel.save()
                        if saved { dismiss() }
                    }
                } label: {
                    Text("Lưu")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 6)
                        .background(
                            viewModel.canSave
                                ? AppGradient.primary
                                : LinearGradient(colors: [Color.surfaceColor], startPoint: .top, endPoint: .bottom),
                            in: Capsule()
                        )
                }
                .disabled(!viewModel.canSave)
            }
        }
    }
}

#Preview {
    NavigationStack {
        TransactionFormView(transaction: nil, onSave: {})
    }
}
