"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import { Debt, DebtStatus, DebtType } from "@/types/debt";
import { AlertTriangle, CreditCard, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface DebtListProps {
  debts: Debt[];
  loading: boolean;
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => Promise<void>;
  onPay: (debt: Debt) => void;
}

const STATUS_STYLES: Record<DebtStatus, { accent: string; badge: string; label: string }> = {
  [DebtStatus.Unpaid]:        { accent: "bg-red-500",    badge: "bg-red-500/10 text-red-600",    label: "Chưa trả" },
  [DebtStatus.PartiallyPaid]: { accent: "bg-yellow-500", badge: "bg-yellow-500/10 text-yellow-600", label: "Đã trả một phần" },
  [DebtStatus.Paid]:          { accent: "bg-green-500",  badge: "bg-green-500/10 text-green-600", label: "Đã trả hết" },
};

function SkeletonItem() {
  return (
    <div className="rounded-xl overflow-hidden ring-1 ring-border/60 border-transparent bg-card">
      <div className="h-0.5 bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-muted animate-pulse shrink-0" />
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
          <div className="h-5 w-24 bg-muted rounded animate-pulse" />
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
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-sm">Chưa có khoản nợ nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {debts.map((debt) => {
        const isBorrowed = debt.type === DebtType.Borrowed;
        const styles     = STATUS_STYLES[debt.status];
        const overdue    = isOverdue(debt);
        const paidPct    = debt.amount > 0
          ? Math.min((debt.paidAmount / debt.amount) * 100, 100)
          : 0;

        return (
          <div key={debt.id} className="group rounded-xl overflow-hidden ring-1 ring-border/60 border-transparent bg-card">
            {/* Accent bar — color by status */}
            <div className={`h-0.5 ${styles.accent}`} />

            <div className="p-4 space-y-3">
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base ${
                    isBorrowed
                      ? "bg-red-500/10 text-red-500"
                      : "bg-blue-500/10 text-blue-500"
                  }`}>
                    {isBorrowed ? "📥" : "📤"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold truncate">{debt.title}</p>
                      {overdue && (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isBorrowed ? "Vay từ" : "Cho mượn"}: <span className="font-medium text-foreground">{debt.personName}</span>
                      {debt.dueDate && ` · Hạn: ${formatDate(debt.dueDate)}`}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold tabular-nums ${isBorrowed ? "text-red-500" : "text-blue-500"}`}>
                    {formatCurrency(debt.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    Còn: {formatCurrency(debt.remainingAmount)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              {debt.amount > 0 && (
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${paidPct}%` }}
                    />
                  </div>
                  {debt.paidAmount > 0 && (
                    <p className="text-xs text-muted-foreground tabular-nums">
                      Đã trả {formatCurrency(debt.paidAmount)} ({paidPct.toFixed(0)}%)
                    </p>
                  )}
                </div>
              )}

              {/* Bottom row */}
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${styles.badge}`}>
                  {styles.label}
                </span>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {debt.status !== DebtStatus.Paid && (
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onPay(debt)} title="Thanh toán">
                      <CreditCard className="w-3.5 h-3.5" />
                    </Button>
                  )}

                  {confirmId === debt.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2 text-xs"
                        disabled={deletingId === debt.id}
                        onClick={() => handleDelete(debt.id)}
                      >
                        Xóa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => setConfirmId(null)}
                      >
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(debt)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setConfirmId(debt.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
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


interface DebtListProps {
  debts: Debt[];
  loading: boolean;
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => Promise<void>;
  onPay: (debt: Debt) => void;
}

const STATUS_COLOR: Record<DebtStatus, string> = {
  [DebtStatus.Unpaid]:        "border-red-400 text-red-600",
  [DebtStatus.PartiallyPaid]: "border-yellow-400 text-yellow-600",
  [DebtStatus.Paid]:          "border-green-400 text-green-600",
};


