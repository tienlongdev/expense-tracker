"use client";

import { Badge } from "@/components/ui/badge";
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

const STATUS_COLOR: Record<SavingsStatus, string> = {
  [SavingsStatus.Active]:  "border-green-400 text-green-600",
  [SavingsStatus.Matured]: "border-yellow-400 text-yellow-600",
  [SavingsStatus.Closed]:  "border-gray-400 text-gray-500",
};

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
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
        ))}
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
        const plColor   = acc.profitLoss >= 0 ? "text-green-500" : "text-red-500";
        const plPrefix  = acc.profitLoss >= 0 ? "+" : "";

        return (
          <div key={acc.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold">{acc.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {SAVINGS_TYPE_LABELS[acc.type]}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${STATUS_COLOR[acc.status]}`}>
                    {SAVINGS_STATUS_LABELS[acc.status]}
                  </Badge>
                </div>
                {acc.maturityDate && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Đáo hạn: {formatDate(acc.maturityDate)}
                    {acc.interestRate && ` · ${acc.interestRate}%/năm`}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold">{formatCurrency(acc.currentValue)}</p>
                <p className={`text-xs font-medium ${plColor}`}>
                  {plPrefix}{formatCurrency(acc.profitLoss)}
                </p>
              </div>
            </div>

            {/* Progress bar (principal → current value) */}
            {acc.principalAmount > 0 && (
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      acc.profitLoss >= 0 ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(Math.abs((acc.profitLoss / acc.principalAmount) * 100), 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Vốn: {formatCurrency(acc.principalAmount)}
                  {acc.principalAmount > 0 &&
                    ` · ${plPrefix}${((acc.profitLoss / acc.principalAmount) * 100).toFixed(1)}%`}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {isActive ? (
                <div className="flex gap-1 flex-wrap">
                  <Button size="icon-xs" variant="outline" onClick={() => onDeposit(acc)} title="Nạp vốn">
                    <ArrowDownCircle className="w-3.5 h-3.5 text-green-500" />
                  </Button>
                  <Button size="icon-xs" variant="outline" onClick={() => onWithdraw(acc)} title="Rút vốn">
                    <ArrowUpCircle className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                  <Button size="icon-xs" variant="outline" onClick={() => onUpdateValue(acc)} title="Cập nhật giá trị">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                  </Button>
                  <Button size="icon-xs" variant="outline" onClick={() => onInterest(acc)} title="Nhận lãi">
                    <span className="text-xs font-bold text-yellow-500">₫</span>
                  </Button>
                  <Button size="icon-xs" variant="outline" onClick={() => onClose(acc)} title="Đóng tài khoản">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ) : (
                <div />
              )}

              <div className="flex gap-1">
                <Button size="icon-xs" variant="ghost" onClick={() => onHistory(acc)} title="Lịch sử">
                  <History className="w-3.5 h-3.5" />
                </Button>
                {isActive && (
                  <Button size="icon-xs" variant="ghost" onClick={() => onEdit(acc)} title="Sửa">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                )}
                {confirmId === acc.id ? (
                  <>
                    <Button
                      size="icon-xs"
                      variant="destructive"
                      disabled={deletingId === acc.id}
                      onClick={() => handleDelete(acc.id)}
                    >
                      Xóa
                    </Button>
                    <Button size="icon-xs" variant="outline" onClick={() => setConfirmId(null)}>
                      Hủy
                    </Button>
                  </>
                ) : (
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmId(acc.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
