"use client";

import DebtForm from "@/components/debt/DebtForm";
import DebtList from "@/components/debt/DebtList";
import PaymentForm from "@/components/debt/PaymentForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDebt } from "@/hooks/useDebt";
import { formatCurrency } from "@/lib/format";
import { Debt, DebtType } from "@/types/debt";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function DebtPage() {
  const { debts, summary, loading, error, createDebt, updateDebt, deleteDebt, addPayment } =
    useDebt();

  const [debtDialog, setDebtDialog]   = useState(false);
  const [payDialog, setPayDialog]     = useState(false);
  const [editing, setEditing]         = useState<Debt | undefined>();
  const [paying, setPaying]           = useState<Debt | undefined>();
  const [mutating, setMutating]       = useState(false);
  const [mutError, setMutError]       = useState<string | null>(null);
  const [tab, setTab]                 = useState<"all" | "borrowed" | "lent" | "overdue">("all");

  const openCreate = () => {
    setEditing(undefined);
    setMutError(null);
    setDebtDialog(true);
  };
  const openEdit = (debt: Debt) => {
    setEditing(debt);
    setMutError(null);
    setDebtDialog(true);
  };
  const openPay = (debt: Debt) => {
    setPaying(debt);
    setMutError(null);
    setPayDialog(true);
  };

  const handleDebtSubmit = async (dto: Parameters<typeof createDebt>[0]) => {
    try {
      setMutating(true);
      setMutError(null);
      if (editing) {
        await updateDebt(editing.id, dto as Parameters<typeof updateDebt>[1]);
      } else {
        await createDebt(dto as Parameters<typeof createDebt>[0]);
      }
      setDebtDialog(false);
    } catch (err) {
      setMutError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setMutating(false);
    }
  };

  const handlePaySubmit = async (dto: Parameters<typeof addPayment>[1]) => {
    if (!paying) return;
    try {
      setMutating(true);
      setMutError(null);
      await addPayment(paying.id, dto);
      setPayDialog(false);
    } catch (err) {
      setMutError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDebt(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể xóa khoản nợ");
    }
  };

  const now = new Date();
  const filtered =
    tab === "borrowed"
      ? debts.filter((d) => d.type === DebtType.Borrowed)
      : tab === "lent"
      ? debts.filter((d) => d.type === DebtType.Lent)
      : tab === "overdue"
      ? debts.filter((d) => d.dueDate && new Date(d.dueDate) < now && d.remainingAmount > 0)
      : debts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý nợ</h1>
          <p className="text-sm text-muted-foreground mt-1">{debts.length} khoản nợ</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Thêm khoản nợ
        </Button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl overflow-hidden ring-1 ring-border/60 border-transparent bg-card">
            <div className="h-0.5 bg-red-500" />
            <div className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tôi đang nợ</p>
              <p className="text-lg font-bold tabular-nums mt-0.5 text-red-500">
                {formatCurrency(summary.totalBorrowed)}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                Còn lại: {formatCurrency(summary.totalBorrowedRemaining)}
              </p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden ring-1 ring-border/60 border-transparent bg-card">
            <div className="h-0.5 bg-blue-500" />
            <div className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Người khác nợ tôi</p>
              <p className="text-lg font-bold tabular-nums mt-0.5 text-blue-500">
                {formatCurrency(summary.totalLent)}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                Còn lại: {formatCurrency(summary.totalLentRemaining)}
              </p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden ring-1 ring-border/60 border-transparent bg-card">
            <div className={`h-0.5 ${summary.overdueCount > 0 ? "bg-orange-500" : "bg-muted"}`} />
            <div className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quá hạn</p>
              <p className={`text-lg font-bold tabular-nums mt-0.5 ${summary.overdueCount > 0 ? "text-orange-500" : "text-muted-foreground"}`}>
                {summary.overdueCount} <span className="text-sm font-normal">khoản</span>
              </p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden ring-1 ring-border/60 border-transparent bg-card">
            {(() => { const net = summary.totalLentRemaining - summary.totalBorrowedRemaining; return (
              <>
                <div className={`h-0.5 ${net >= 0 ? "bg-green-500" : "bg-red-500"}`} />
                <div className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Số dư thực</p>
                  <p className={`text-lg font-bold tabular-nums mt-0.5 ${net >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {net >= 0 ? "+" : "\u2212"}{formatCurrency(Math.abs(net))}
                  </p>
                </div>
              </>
            ); })()}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "borrowed", "lent", "overdue"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t === "all" ? "Tất cả" : t === "borrowed" ? "📥 Tôi vay" : t === "lent" ? "📤 Tôi cho mượn" : "⚠️ Quá hạn"}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <DebtList
        debts={filtered}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        onPay={openPay}
      />

      {/* Debt dialog */}
      <Dialog open={debtDialog} onOpenChange={setDebtDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa khoản nợ" : "Thêm khoản nợ"}</DialogTitle>
          </DialogHeader>
          {mutError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {mutError}
            </div>
          )}
          <DebtForm
            debt={editing}
            onSubmit={handleDebtSubmit}
            onCancel={() => setDebtDialog(false)}
            loading={mutating}
          />
        </DialogContent>
      </Dialog>

      {/* Payment dialog */}
      <Dialog open={payDialog} onOpenChange={setPayDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Ghi nhận thanh toán — {paying?.title}
            </DialogTitle>
          </DialogHeader>
          {mutError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {mutError}
            </div>
          )}
          {paying && (
            <PaymentForm
              maxAmount={paying.remainingAmount}
              onSubmit={handlePaySubmit}
              onCancel={() => setPayDialog(false)}
              loading={mutating}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
