"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";
import { formatCurrency } from "@/lib/format";
import { Budget } from "@/types/budget";
import { useState } from "react";

interface BudgetListProps {
  budgets: Budget[];
  loading: boolean;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => Promise<void>;
}

function SkeletonItem() {
  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-border/40 bg-card shadow-sm transition-all duration-200 hover:shadow-md p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-5 w-10 bg-muted rounded animate-pulse shrink-0" />
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full animate-pulse" />
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

  // Only show categories that have a budget set
  const withBudget = budgets.filter((b) => b.hasBudget);
  // Categories spending without budget — show as info
  const noBudget   = budgets.filter((b) => !b.hasBudget && b.spentAmount > 0);

  if (withBudget.length === 0 && noBudget.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Chưa có ngân sách nào cho tháng này
      </div>
    );
  }

  const renderItem = (b: Budget) => {
    const pct  = Number(b.usedPercent ?? 0);
    const pctD = Math.min(pct, 100);
    const over = pct > 100;
    const warn = !over && pct >= 80;

    const progressBar = over ? "bg-red-500" : warn ? "bg-yellow-500" : "bg-emerald-500";
    const pctColor    = over ? "text-red-500" : warn ? "text-yellow-600 dark:text-yellow-500" : "text-emerald-600 dark:text-emerald-500";

    const rowId = b.budgetId ?? b.categoryId;

    return (
      <div key={b.categoryId} className="group rounded-2xl overflow-hidden ring-1 ring-border/40 bg-card hover:ring-border transition-all duration-200 shadow-sm hover:shadow-md p-4 space-y-3">
        <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate flex items-center gap-2">
              {b.categoryName}
              {over && <Icon name="alert-triangle" variant="solid" className="w-3.5 h-3.5 text-red-500" />}
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground tabular-nums mt-0.5">
              Đã dùng {formatCurrency(Number(b.spentAmount ?? 0))} / {formatCurrency(Number(b.plannedAmount ?? 0))}
            </p>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto shrink-0 border-t border-border/40 sm:border-0 pt-2 sm:pt-0">
            <span className={`text-sm font-bold tabular-nums pr-2 ${pctColor}`}>
              {pct.toFixed(0)}%
            </span>

            {b.hasBudget && (
              confirmId === rowId ? (
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="destructive" className="h-7 px-2.5 text-xs rounded-lg" disabled={deletingId === rowId} onClick={() => handleDelete(b.budgetId!)}>
                    Xóa
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs rounded-lg" onClick={() => setConfirmId(null)}>
                    Hủy
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150" onClick={() => onEdit(b)}>
                    <Icon name="pencil" className="w-3.5 h-3.5" />
                  </button>
                  <button className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-150" onClick={() => setConfirmId(rowId)}>
                    <Icon name="trash" className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressBar}`}
            style={{ width: `${pctD}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {withBudget.map(renderItem)}

      {noBudget.length > 0 && (
        <div className="pt-4 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Icon name="alert-triangle" className="w-4 h-4 text-orange-500" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Chi tiêu không có ngân sách
            </p>
          </div>
          {noBudget.map((b) => (
            <div key={b.categoryId} className="group rounded-2xl overflow-hidden ring-1 ring-border/40 bg-card hover:ring-border transition-all duration-200 opacity-80 hover:opacity-100">
              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-foreground/80 flex items-center gap-1.5">
                    {b.categoryName}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Chưa phân bổ ngân sách
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold tabular-nums text-foreground/80">
                    {formatCurrency(Number(b.spentAmount ?? 0))}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
