import SwiftUI

struct BudgetFormView: View {
    @StateObject private var formVM: BudgetFormViewModel
    @Environment(\.dismiss) private var dismiss

    init(budgetRecord: BudgetRecord?, year: Int, month: Int, onSave: @escaping () -> Void) {
        _formVM = StateObject(wrappedValue: BudgetFormViewModel(
            budgetRecord: budgetRecord,
            year: year,
            month: month,
            onSave: onSave
        ))
    }

    var body: some View {
        ZStack {
            Color.appBackground.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    // Category Picker
                    VStack(alignment: .leading, spacing: 10) {
                        Text("DANH MỤC CHI TIÊU")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Color.textTertiary)
                            .padding(.leading, 2)

                        Group {
                            if formVM.isLoadingCategories {
                                HStack {
                                    Spacer()
                                    ProgressView().tint(Color.accentPurple)
                                    Spacer()
                                }
                                .padding(20)
                            } else {
                                LazyVGrid(columns: [.init(.flexible()), .init(.flexible()), .init(.flexible())], spacing: 8) {
                                    ForEach(formVM.expenseCategories) { cat in
                                        categoryChip(cat)
                                    }
                                }
                                .padding(12)
                            }
                        }
                        .glassCard()
                    }

                    // Amount
                    VStack(alignment: .leading, spacing: 10) {
                        Text("SỐ TIỀN KẾ HOẠCH")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Color.textTertiary)
                            .padding(.leading, 2)

                        HStack {
                            Image(systemName: "dong.sign")
                                .foregroundStyle(Color.textTertiary)
                                .frame(width: 20)
                            TextField("Nhập số tiền", text: $formVM.plannedAmount)
                                .keyboardType(.decimalPad)
                                .foregroundColor(Color.textPrimary)
                                .onChange(of: formVM.plannedAmount) { _, newValue in
                                    let formatted = newValue.formattedAmount
                                    if formVM.plannedAmount != formatted {
                                        formVM.plannedAmount = formatted
                                    }
                                }
                            Text("₫")
                                .foregroundStyle(Color.textSecondary)
                                .font(.subheadline.weight(.medium))
                        }
                        .padding(14)
                        .background(Color.cardBackground, in: RoundedRectangle(cornerRadius: 14))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(Color.borderColor, lineWidth: 0.5)
                        )
                    }

                    // Note
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
                            TextField("Thêm ghi chú...", text: $formVM.note, axis: .vertical)
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

                    if let error = formVM.error {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                            Text(error).font(.subheadline)
                        }
                        .foregroundStyle(.red)
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.red.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
                    }
                }
                .padding(16)
            }
        }
        .navigationTitle(formVM.isEditing ? "Sửa ngân sách" : "Ngân sách mới")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Color.cardBackground, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button("Huỷ") { dismiss() }
                    .foregroundStyle(Color.textSecondary)
            }
            ToolbarItem(placement: .topBarTrailing) {
                if formVM.isSaving {
                    ProgressView().tint(Color.accentPurple)
                } else {
                    Button {
                        Task { if await formVM.save() { dismiss() } }
                    } label: {
                        Text("Lưu")
                            .font(.subheadline.weight(.bold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 6)
                            .background(
                                formVM.canSave
                                    ? AppGradient.primary
                                    : LinearGradient(colors: [Color.surfaceColor], startPoint: .top, endPoint: .bottom),
                                in: Capsule()
                            )
                    }
                    .disabled(!formVM.canSave)
                }
            }
        }
        .task { await formVM.loadCategories() }
    }

    private func categoryChip(_ cat: Category) -> some View {
        let isSelected = formVM.selectedCategoryId == cat.id
        return Button {
            withAnimation(.spring(response: 0.2)) {
                formVM.selectedCategoryId = cat.id
            }
        } label: {
            VStack(spacing: 4) {
                Text(cat.icon ?? "📦")
                    .font(.system(size: 22))
                    .padding(8)
                    .background(
                        isSelected
                            ? AppGradient.expense
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
        }
        .buttonStyle(.plain)
    }
}

// MARK: - ViewModel

@MainActor
final class BudgetFormViewModel: ObservableObject {
    @Published var selectedCategoryId: String = ""
    @Published var plannedAmount: String = ""
    @Published var note: String = ""
    @Published var expenseCategories: [Category] = []
    @Published var isLoadingCategories = false
    @Published var isSaving = false
    @Published var error: String?

    let isEditing: Bool
    private let budgetRecord: BudgetRecord?
    private let year: Int
    private let month: Int
    private let onSave: () -> Void
    private let client = APIClient.shared

    init(budgetRecord: BudgetRecord?, year: Int, month: Int, onSave: @escaping () -> Void) {
        self.budgetRecord = budgetRecord
        self.year = year
        self.month = month
        self.onSave = onSave
        self.isEditing = budgetRecord != nil

        if let r = budgetRecord {
            self.selectedCategoryId = r.categoryId
            self.plannedAmount = r.plannedAmount == 0 ? "" : r.plannedAmount.formatted
            self.note = r.note ?? ""
        }
    }

    var canSave: Bool {
        !selectedCategoryId.isEmpty && plannedAmount.rawAmount > 0
    }

    func loadCategories() async {
        isLoadingCategories = true
        do {
            let cats: [Category] = try await client.get("/api/category/type/2")
            expenseCategories = cats
            if selectedCategoryId.isEmpty {
                selectedCategoryId = cats.first?.id ?? ""
            }
        } catch {
            self.error = error.localizedDescription
        }
        isLoadingCategories = false
    }

    func save() async -> Bool {
        let amount = plannedAmount.rawAmount
        guard amount > 0 else { return false }
        isSaving = true
        error = nil
        do {
            if let record = budgetRecord {
                let body = UpdateBudgetRequest(plannedAmount: amount, note: note.isEmpty ? nil : note)
                let _: BudgetRecord = try await client.put("/api/budget/\(record.id)", body: body)
            } else {
                let body = CreateBudgetRequest(
                    categoryId: selectedCategoryId,
                    year: year,
                    month: month,
                    plannedAmount: amount,
                    note: note.isEmpty ? nil : note
                )
                let _: BudgetRecord = try await client.post("/api/budget", body: body)
            }
            onSave()
            isSaving = false
            return true
        } catch {
            self.error = error.localizedDescription
            isSaving = false
            return false
        }
    }
}

#Preview {
    NavigationStack {
        BudgetFormView(budgetRecord: nil, year: 2026, month: 3, onSave: {})
    }
}
