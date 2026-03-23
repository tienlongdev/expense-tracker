"use client";

import CategoryForm from "@/components/category/CategoryForm";
import CategoryList from "@/components/category/CategoryList";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useCategories } from "@/hooks/useCategories";
import { Category, CreateCategoryDto, UpdateCategoryDto } from "@/types/category";
import { TransactionType } from "@/types/transaction";
import Icon from "@/components/ui/Icon";
import { useState } from "react";

export default function CategoryPage() {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } =
    useCategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>();
  const [mutating, setMutating] = useState(false);
  const [mutError, setMutError] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "income" | "expense">("all");

  const openCreate = () => {
    setEditing(undefined);
    setMutError(null);
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setMutError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (dto: CreateCategoryDto | UpdateCategoryDto) => {
    try {
      setMutating(true);
      setMutError(null);
      if (editing) {
        await updateCategory(editing.id, dto as UpdateCategoryDto);
      } else {
        await createCategory(dto as CreateCategoryDto);
      }
      setDialogOpen(false);
    } catch (err) {
      setMutError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể xóa danh mục");
    }
  };

  const filtered =
    tab === "all"
      ? categories
      : tab === "income"
      ? categories.filter((c) => c.type === TransactionType.Income)
      : categories.filter((c) => c.type === TransactionType.Expense);

  const incomeCount  = categories.filter((c) => c.type === TransactionType.Income).length;
  const expenseCount = categories.filter((c) => c.type === TransactionType.Expense).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Danh mục</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {categories.length} danh mục · {incomeCount} thu nhập · {expenseCount} chi tiêu
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Icon name="plus" className="w-4 h-4 mr-1" />
          Thêm danh mục
        </Button>
      </div>

      {/* Summary mini-cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl overflow-hidden ring-1 ring-border/40 border-transparent bg-card shadow-sm transition-all duration-200 hover:ring-border">
          <div className="h-0.5 bg-primary" />
          <div className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tất cả</p>
            <p className="text-lg font-bold tabular-nums mt-0.5">{categories.length}</p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden ring-1 ring-border/40 border-transparent bg-card shadow-sm transition-all duration-200 hover:ring-border">
          <div className="h-0.5 bg-green-500" />
          <div className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Thu nhập</p>
            <p className="text-lg font-bold tabular-nums mt-0.5 text-green-500">{incomeCount}</p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden ring-1 ring-border/40 border-transparent bg-card shadow-sm transition-all duration-200 hover:ring-border">
          <div className="h-0.5 bg-red-500" />
          <div className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Chi tiêu</p>
            <p className="text-lg font-bold tabular-nums mt-0.5 text-red-500">{expenseCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["all", "income", "expense"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t
                ? t === "income"
                  ? "bg-green-500 text-white"
                  : t === "expense"
                  ? "bg-red-500 text-white"
                  : "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t === "all" ? "Tất cả" : t === "income" ? "Thu nhập" : "Chi tiêu"}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <CategoryList
        categories={filtered}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa danh mục" : "Thêm danh mục"}</DialogTitle>
          </DialogHeader>
          {mutError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {mutError}
            </div>
          )}
          <CategoryForm
            category={editing}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            loading={mutating}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
