"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";
import { formatCurrency, formatDate } from "@/lib/format";
import { Debt, DebtStatus, DebtType } from "@/types/debt";
import { useState } from "react";

interface DebtListProps {
  debts: Debt[];
  loading: boolean;
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => Promise<void>;
  onPay: (debt: Debt) => void;
}

const STATUS_STYLES: Record<DebtStatus, { accent: string; badge: string; label: string }> = {
  [DebtStatus.Unpaid]:        { accent: "bg-rose-500",   badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400",    label: "Chưa trả" },
  [DebtStatus.PartiallyPaid]: { accent: "bg-amber-500",  badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400", label: "Đã trả một phần" },
  [DebtStatus.Paid]:          { accent: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", label: "Đã trả hết" },
};

function SkeletonItem() {
  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-border/40 bg-card shadow-sm">
      <div className="h-0.5 bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted animate-pulse shrink-0" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-44 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-1.5 text-right">
            <div className="h-3.5 w-20 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full animate-pulse" />
        <div className="flex justify-between">
          <div className="h-5 w-24 bg-muted rounded-full animate-pulse" />
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function DebtList({ debts, loading, onEdit, onDelete, onPay }: DebtListProps) {
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await onDelete(id); }
    finally { setDeletingId(null); setConfirmId(null); }
  };

  const isOverdue = (debt: Debt) =>
    debt.dueDate && debt.status !== DebtStatus.Paid && new Date(debt.dueDate) < new Date();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonItem key={i} />)}
      </div>
    );
  }

  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-muted-foreground gap-2">
        <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
          <Icon name="credit-card" className="w-7 h-7 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium text-foreground/50">Chưa có khoản nợ nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {debts.map((debt) => {
        const isBorrowed = debt.type === DebtType.Borrowed;
        const styles     = STATUS_STYLES[debt.status];
        const overdue    = isOverdue(debt);
        const paidPct    = debt.originalAmount > 0
          ? Math.min((debt.paidAmount / debt.originalAmount) * 100, 100)
          : 0;

        return (
          <div
            key={debt.id}
            className="group rounded-2xl overflow-hidden ring-1 ring-border/40 bg-card hover:ring-border hover:shadow-md shadow-sm transition-all duration-200"
          >
            {/* Accent bar */}
            <div className={`h-0.5 ${styles.accent}`} />

            <div className="p-4 space-y-3">
              {/* ── Top row ── */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">

                  {/* Type icon — styled gradient container */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105
                    ${isBorrowed
                      ? "bg-gradient-to-br from-rose-400/20 to-rose-600/10"
                      : "bg-gradient-to-br from-blue-400/20 to-blue-600/10"
                    }`}
                  >
                    <Icon
                      name={isBorrowed ? "arrow-down" : "arrow-up"}
                      variant="solid"
                      className={`w-5 h-5 ${isBorrowed ? "text-rose-500" : "text-blue-500"}`}
                    />
                  </div>

                  {/* Text info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold truncate">{debt.title}</p>
                      {overdue && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[10px] font-semibold">
                          <Icon name="alert-triangle" variant="solid" className="w-3 h-3" />
                          Quá hạn
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md
                        ${isBorrowed ? "bg-rose-500/8 text-rose-500" : "bg-blue-500/8 text-blue-500"}`}>
                        <Icon name={isBorrowed ? "arrow-down-circle" : "arrow-up-circle"} className="w-3 h-3" />
                        {isBorrowed ? "Vay từ" : "Cho mượn"}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">{debt.personName}</span>
                      {debt.dueDate && (
                        <span className="text-[11px] text-muted-foreground">· Hạn {formatDate(debt.dueDate)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold tabular-nums ${isBorrowed ? "text-rose-500" : "text-blue-500"}`}>
                    {formatCurrency(debt.originalAmount)}
                  </p>
                  <p className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                    Còn {formatCurrency(debt.remainingAmount)}
                  </p>
                </div>
              </div>

              {/* ── Progress bar ── */}
              {debt.originalAmount > 0 && (
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500
                        ${paidPct >= 100 ? "bg-emerald-500" : paidPct >= 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${paidPct}%` }}
                    />
                  </div>
                  {debt.paidAmount > 0 && (
                    <p className="text-[10px] text-muted-foreground tabular-nums">
                      Đã trả {formatCurrency(debt.paidAmount)} · {paidPct.toFixed(0)}%
                    </p>
                  )}
                </div>
              )}

              {/* ── Bottom row ── */}
              <div className="flex items-center justify-between gap-2">
                {/* Status badge */}
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${styles.accent}`} />
                  {styles.label}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  {/* Pay button */}
                  {debt.status !== DebtStatus.Paid && (
                    <button
                      onClick={() => onPay(debt)}
                      title="Ghi nhận thanh toán"
                      className="h-7 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1
                        bg-emerald-500/10 text-emerald-600 dark:text-emerald-400
                        hover:bg-emerald-500/20 transition-colors duration-150"
                    >
                      <Icon name="credit-card" variant="solid" className="w-3.5 h-3.5" />
                      Trả nợ
                    </button>
                  )}

                  {confirmId === debt.id ? (
                    <>
                      <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" disabled={deletingId === debt.id} onClick={() => handleDelete(debt.id)}>
                        Xóa
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setConfirmId(null)}>
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onEdit(debt)}
                        title="Chỉnh sửa"
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground
                          hover:text-foreground hover:bg-accent transition-all duration-150 hover:scale-110"
                      >
                        <Icon name="pencil" className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmId(debt.id)}
                        title="Xóa"
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground
                          hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-150 hover:scale-110"
                      >
                        <Icon name="trash" className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
