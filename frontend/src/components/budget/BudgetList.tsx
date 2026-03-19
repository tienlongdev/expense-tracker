"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { Budget } from "@/types/budget";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface BudgetListProps {
  budgets: Budget[];
  loading: boolean;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function BudgetList({ budgets, loading, onEdit, onDelete }: BudgetListProps) {
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await onDelete(id); }
    finally { setDeletingId(null); setConfirmId(null); }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Chưa có ngân sách nào cho tháng này
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {budgets.map((b) => {
  const percentUsed = Number(b.percentUsed ?? 0);
  const pct = Math.min(percentUsed, 100);
  const over = percentUsed > 100;
  const barClr = over ? "bg-red-500" : pct > 80 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div key={b.id} className="rounded-xl border border-border bg-card px-4 py-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{b.categoryName}</p>
          <p className="text-xs text-muted-foreground">
          
            Đã dùng {formatCurrency(Number(b.actualAmount ?? 0))} / {formatCurrency(Number(b.plannedAmount ?? 0))}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`text-xs font-semibold ${
              over ? "text-red-500" : pct > 80 ? "text-yellow-500" : "text-green-500"
            }`}
          >
            {percentUsed.toFixed(0)}%
          </span>
          {confirmId === b.id ? (
            <>
              <Button
                size="icon-xs"
                variant="destructive"
                disabled={deletingId === b.id}
                onClick={() => handleDelete(b.id)}
              >
                Xóa
              </Button>
              <Button size="icon-xs" variant="outline" onClick={() => setConfirmId(null)}>
                Hủy
              </Button>
            </>
          ) : (
            <>
              <Button size="icon-xs" variant="ghost" onClick={() => onEdit(b)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmId(b.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barClr}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
})}
    </div>
  );
}
