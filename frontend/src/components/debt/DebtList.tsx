"use client";

import { Badge } from "@/components/ui/badge";
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

const STATUS_COLOR: Record<DebtStatus, string> = {
  [DebtStatus.Unpaid]:        "border-red-400 text-red-600",
  [DebtStatus.PartiallyPaid]: "border-yellow-400 text-yellow-600",
  [DebtStatus.Paid]:          "border-green-400 text-green-600",
};

const STATUS_LABEL: Record<DebtStatus, string> = {
  [DebtStatus.Unpaid]:        "Chưa trả",
  [DebtStatus.PartiallyPaid]: "Đã trả một phần",
  [DebtStatus.Paid]:          "Đã trả hết",
};

export default function DebtList({ debts, loading, onEdit, onDelete, onPay }: DebtListProps) {
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const isOverdue = (debt: Debt) =>
    debt.dueDate &&
    debt.status !== DebtStatus.Paid &&
    new Date(debt.dueDate) < new Date();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
        ))}
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
      {debts.map((debt) => (
        <div
          key={debt.id}
          className="rounded-xl border border-border bg-card p-4 space-y-3"
        >
          {/* Top row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  debt.type === DebtType.Borrowed
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                    : "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                }`}
              >
                {debt.type === DebtType.Borrowed ? "📥" : "📤"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold truncate">{debt.title}</p>
                  {isOverdue(debt) && (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {debt.type === DebtType.Borrowed ? "Vay từ" : "Cho mượn"}: {debt.personName}
                  {debt.dueDate && ` · Hạn: ${formatDate(debt.dueDate)}`}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p
                className={`text-sm font-bold ${
                  debt.type === DebtType.Borrowed ? "text-red-500" : "text-blue-500"
                }`}
              >
                {formatCurrency(debt.amount)}
              </p>
              <p className="text-xs text-muted-foreground">
                Còn lại: {formatCurrency(debt.remainingAmount)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {debt.amount > 0 && (
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${Math.min((debt.paidAmount / debt.amount) * 100, 100)}%` }}
              />
            </div>
          )}

          {/* Bottom row */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className={`text-xs ${STATUS_COLOR[debt.status]}`}>
              {STATUS_LABEL[debt.status]}
            </Badge>

            <div className="flex items-center gap-1">
              {debt.status !== DebtStatus.Paid && (
                <Button size="icon-xs" variant="outline" onClick={() => onPay(debt)}>
                  <CreditCard className="w-3.5 h-3.5" />
                </Button>
              )}

              {confirmId === debt.id ? (
                <>
                  <Button
                    size="icon-xs"
                    variant="destructive"
                    disabled={deletingId === debt.id}
                    onClick={() => handleDelete(debt.id)}
                  >
                    Xóa
                  </Button>
                  <Button size="icon-xs" variant="outline" onClick={() => setConfirmId(null)}>
                    Hủy
                  </Button>
                </>
              ) : (
                <>
                  <Button size="icon-xs" variant="ghost" onClick={() => onEdit(debt)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmId(debt.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
