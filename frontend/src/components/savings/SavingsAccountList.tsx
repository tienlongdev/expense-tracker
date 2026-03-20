"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import {
    SAVINGS_STATUS_LABELS,
    SAVINGS_TYPE_LABELS,
    SavingsAccount,
    SavingsStatus,
} from "@/types/savings";
import {
    ArrowDownCircle,
    ArrowUpCircle,
    History,
    Pencil,
    RefreshCw,
    Trash2,
    X,
} from "lucide-react";
import { useState } from "react";

interface SavingsAccountListProps {
  accounts: SavingsAccount[];
  loading: boolean;
  onEdit: (account: SavingsAccount) => void;
  onDelete: (id: string) => Promise<void>;
  onDeposit: (account: SavingsAccount) => void;
  onWithdraw: (account: SavingsAccount) => void;
  onUpdateValue: (account: SavingsAccount) => void;
  onInterest: (account: SavingsAccount) => void;
  onHistory: (account: SavingsAccount) => void;
  onClose: (account: SavingsAccount) => void;
}

const STATUS_STYLES: Record<SavingsStatus, { accent: string; badge: string; label: string }> = {
  [SavingsStatus.Active]:  { accent: "bg-green-500",  badge: "bg-green-500/10 text-green-600",  label: SAVINGS_STATUS_LABELS[SavingsStatus.Active] },
  [SavingsStatus.Matured]: { accent: "bg-yellow-500", badge: "bg-yellow-500/10 text-yellow-600", label: SAVINGS_STATUS_LABELS[SavingsStatus.Matured] },
  [SavingsStatus.Closed]:  { accent: "bg-muted",      badge: "bg-muted text-muted-foreground",   label: SAVINGS_STATUS_LABELS[SavingsStatus.Closed] },
};

function SkeletonItem() {
  return (
    <div className="rounded-xl overflow-hidden ring-1 ring-border/60 border-transparent bg-card">
      <div className="h-0.5 bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
            <div className="h-3 w-28 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-1.5 text-right">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full animate-pulse" />
        <div className="h-7 w-full bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function SavingsAccountList({
  accounts,
  loading,
  onEdit,
  onDelete,
  onDeposit,
  onWithdraw,
  onUpdateValue,
  onInterest,
  onHistory,
  onClose,
}: SavingsAccountListProps) {
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await onDelete(id); }
    finally { setDeletingId(null); setConfirmId(null); }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonItem key={i} />)}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-sm">Chưa có tài khoản tiết kiệm nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {accounts.map((acc) => {
        const isActive  = acc.status === SavingsStatus.Active;
        const styles    = STATUS_STYLES[acc.status];
        const isProfit  = acc.profitLoss >= 0;
        const plColor   = isProfit ? "text-green-500" : "text-red-500";
        const plPrefix  = isProfit ? "+" : "−";
        const plPct     = acc.totalDeposited > 0
          ? ((Math.abs(acc.profitLoss) / acc.totalDeposited) * 100).toFixed(1)
          : null;

        return (
          <div key={acc.id} className="group rounded-xl overflow-hidden ring-1 ring-border/60 border-transparent bg-card">
            {/* Accent bar */}
            <div className={`h-0.5 ${styles.accent}`} />

            <div className="p-4 space-y-3">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{acc.name}</p>
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                      {SAVINGS_TYPE_LABELS[acc.type]}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${styles.badge}`}>
                      {styles.label}
                    </span>
                  </div>
                  {(acc.maturityDate || acc.interestRate) && (
                    <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                      {acc.maturityDate && `Đáo hạn: ${formatDate(acc.maturityDate)}`}
                      {acc.interestRate && ` · ${acc.interestRate}%/năm`}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-bold tabular-nums">{formatCurrency(acc.currentValue)}</p>
                  <p className={`text-xs font-medium tabular-nums ${plColor}`}>
                    {plPrefix}{formatCurrency(Math.abs(acc.profitLoss))}
                    {plPct && <span className="ml-1 opacity-70">({isProfit ? "+" : "−"}{plPct}%)</span>}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              {acc.totalDeposited > 0 && (
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isProfit ? "bg-green-500" : "bg-red-500"}`}
                      style={{ width: `${Math.min(Math.abs((acc.profitLoss / acc.totalDeposited) * 100), 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    Vốn: {formatCurrency(acc.totalDeposited)}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {isActive ? (
                  <div className="flex gap-1 flex-wrap">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onDeposit(acc)} title="Nạp vốn">
                      <ArrowDownCircle className="w-3.5 h-3.5 text-green-500" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onWithdraw(acc)} title="Rút vốn">
                      <ArrowUpCircle className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onUpdateValue(acc)} title="Cập nhật giá trị">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onInterest(acc)} title="Nhận lãi">
                      <span className="text-xs font-bold text-yellow-500">₫</span>
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onClose(acc)} title="Đóng tài khoản">
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                ) : (
                  <div />
                )}

                <div className="flex gap-0.5">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onHistory(acc)} title="Lịch sử">
                    <History className="w-3.5 h-3.5" />
                  </Button>
                  {isActive && (
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(acc)} title="Sửa">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {confirmId === acc.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2 text-xs"
                        disabled={deletingId === acc.id}
                        onClick={() => handleDelete(acc.id)}
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
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setConfirmId(acc.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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


interface SavingsAccountListProps {
  accounts: SavingsAccount[];
  loading: boolean;
  onEdit: (account: SavingsAccount) => void;
  onDelete: (id: string) => Promise<void>;
  onDeposit: (account: SavingsAccount) => void;
  onWithdraw: (account: SavingsAccount) => void;
  onUpdateValue: (account: SavingsAccount) => void;
  onInterest: (account: SavingsAccount) => void;
  onHistory: (account: SavingsAccount) => void;
  onClose: (account: SavingsAccount) => void;
}


