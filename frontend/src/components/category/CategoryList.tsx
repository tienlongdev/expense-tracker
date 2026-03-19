"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/category";
import { TransactionType } from "@/types/transaction";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface CategoryListProps {
  categories: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function CategoryList({
  categories,
  loading,
  onEdit,
  onDelete,
}: CategoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
        ))}
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

  return (
    <div className="space-y-2">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                cat.type === TransactionType.Income ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm font-medium">{cat.name}</span>
            <Badge
              variant="outline"
              className={`text-xs ${
                cat.type === TransactionType.Income
                  ? "border-green-400 text-green-600"
                  : "border-red-400 text-red-600"
              }`}
            >
              {cat.type === TransactionType.Income ? "Thu nhập" : "Chi tiêu"}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            {confirmId === cat.id ? (
              <>
                <Button
                  size="icon-xs"
                  variant="destructive"
                  disabled={deletingId === cat.id}
                  onClick={() => handleDelete(cat.id)}
                >
                  {deletingId === cat.id ? "..." : "Xóa"}
                </Button>
                <Button
                  size="icon-xs"
                  variant="outline"
                  onClick={() => setConfirmId(null)}
                >
                  Hủy
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => onEdit(cat)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setConfirmId(cat.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
