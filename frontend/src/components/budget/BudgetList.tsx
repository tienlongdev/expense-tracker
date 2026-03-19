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

function SkeletonItem() {
  return (
    <div className="rounded-xl overflow-hidden ring-1 ring-border/60 border-transparent bg-card">
      <div className="h-0.5 bg-muted animate-pulse" />
      <div className="px-4 py-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="h-3.5 w-32 bg-muted rounded animate-pulse" />
            <div className="h-3 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-5 w-10 bg-muted rounded animate-pulse shrink-0" />
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full animate-pulse" />
      </div>
    </div>
  );
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
        {Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)}
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
        const warn = !over && pct > 80;

        const accentBar = over ? "bg-red-500" : warn ? "bg-yellow-500" : "bg-green-500";
        const progressBar = over ? "bg-red-500" : warn ? "bg-yellow-500" : "bg-green-500";
        const pctColor = over ? "text-red-500" : warn ? "text-yellow-500" : "text-green-500";

        return (
          <div key={b.id} className="group rounded-xl overflow-hidden ring-1 ring-border/60 border-transparent bg-card">
            <div className={`h-0.5 ${accentBar}`} />
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{b.categoryName}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    Đã dùng {formatCurrency(Number(b.actualAmount ?? 0))} / {formatCurrency(Number(b.plannedAmount ?? 0))}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-xs font-semibold tabular-nums ${pctColor}`}>
                    {percentUsed.toFixed(0)}%
                  </span>

                  {confirmId === b.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-6 px-2 text-xs"
                        disabled={deletingId === b.id}
                        onClick={() => handleDelete(b.id)}
                      >
                        Xóa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => setConfirmId(null)}
                      >
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => onEdit(b)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => setConfirmId(b.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${progressBar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
