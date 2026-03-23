"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";
import { Category } from "@/types/category";
import { TransactionType } from "@/types/transaction";
import { useState } from "react";

interface CategoryListProps {
  categories: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => Promise<void>;
}

function SkeletonItem() {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg ring-1 ring-border/40 border-transparent bg-card shadow-sm animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-muted" />
        <div className="h-3.5 w-28 bg-muted rounded" />
        <div className="h-5 w-16 bg-muted rounded-md" />
      </div>
      <div className="flex gap-1">
        <div className="w-6 h-6 bg-muted rounded" />
        <div className="w-6 h-6 bg-muted rounded" />
      </div>
    </div>
  );
}

export default function CategoryList({
  categories,
  loading,
  onEdit,
  onDelete,
}: CategoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId]   = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await onDelete(id); }
    finally { setDeletingId(null); setConfirmId(null); }
  };

  if (loading) {
    return (
      <div className="space-y-1.5">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonItem key={i} />)}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">Chưa có danh mục nào</p>
      </div>
    );
  }

  const income  = categories.filter((c) => c.type === TransactionType.Income);
  const expense = categories.filter((c) => c.type === TransactionType.Expense);

  const renderGroup = (list: Category[], label: string, dotColor: string) =>
    list.length > 0 && (
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
          {label} · {list.length}
        </p>
        {list.map((cat) => (
          <div
            key={cat.id}
            className="group flex items-center justify-between px-4 py-2.5 rounded-lg ring-1 ring-border/40 border-transparent bg-card shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
              <span className="text-sm font-medium truncate">{cat.name}</span>
            </div>

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {confirmId === cat.id ? (
                <>
                  <Button size="sm" variant="destructive" className="h-6 px-2 text-xs" disabled={deletingId === cat.id} onClick={() => handleDelete(cat.id)}>
                    {deletingId === cat.id ? "..." : "Xóa"}
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => setConfirmId(null)}>
                    Hủy
                  </Button>
                </>
              ) : (
                <>
                  <Button size="icon" variant="ghost" className="h-6 w-6 hover:scale-110 transition-transform" onClick={() => onEdit(cat)}>
                    <Icon name="pencil" className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive hover:scale-110 transition-transform" onClick={() => setConfirmId(cat.id)}>
                    <Icon name="trash" className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="space-y-4">
      {renderGroup(income,  "Thu nhập", "bg-green-500")}
      {renderGroup(expense, "Chi tiêu", "bg-red-500")}
    </div>
  );
}
