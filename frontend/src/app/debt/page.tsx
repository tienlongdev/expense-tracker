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
import { CreateDebtDto, Debt, DebtType, UpdateDebtDto } from "@/types/debt";
import Icon from "@/components/ui/Icon";
import { SummaryCard } from "@/components/ui/SummaryCard";
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

  const handleDebtSubmit = async (dto: CreateDebtDto | UpdateDebtDto) => {
    try {
      setMutating(true);
      setMutError(null);
      if (editing) {
        await updateDebt(editing.id, dto as UpdateDebtDto);
      } else {
        await createDebt(dto as CreateDebtDto);
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
          <h1 className="text-xl font-semibold tracking-tight">Quản lý nợ</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{debts.length} khoản nợ</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Icon name="plus" className="w-4 h-4 mr-1" />
          Thêm khoản nợ
        </Button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            title="Tôi đang nợ"
            value={formatCurrency(summary.totalBorrowed)}
            subtitle={`Còn lại: ${formatCurrency(summary.totalBorrowedRemaining)}`}
            icon="arrow-down-left"
            theme="rose"
          />
          <SummaryCard
            title="Người khác nợ tôi"
            value={formatCurrency(summary.totalLent)}
            subtitle={`Còn lại: ${formatCurrency(summary.totalLentRemaining)}`}
            icon="arrow-up-right"
            theme="blue"
          />
          <SummaryCard
            title="Quá hạn"
            value={
              <>
                {summary.overdueCount} <span className="text-sm font-normal text-muted-foreground">khoản</span>
              </>
            }
            icon="alert-triangle"
            theme={summary.overdueCount > 0 ? "orange" : "default"}
          />
          {(() => {
            const net = summary.totalLentRemaining - summary.totalBorrowedRemaining;
            return (
              <SummaryCard
                title="Số dư thực"
                value={(net >= 0 ? "+" : "\u2212") + formatCurrency(Math.abs(net))}
                icon="wallet"
                theme={net >= 0 ? "emerald" : "rose"}
              />
            );
          })()}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {([
          { key: "all",      label: "Tất cả",        icon: "list" as const,           color: "" },
          { key: "borrowed", label: "Tôi đang vay",  icon: "arrow-down-circle" as const, color: "text-rose-500" },
          { key: "lent",     label: "Tôi cho mượn",  icon: "arrow-up-circle" as const,   color: "text-blue-500" },
          { key: "overdue",  label: "Quá hạn",       icon: "alert-triangle" as const,    color: "text-amber-500" },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              tab === t.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon name={t.icon} variant={tab === t.key ? "solid" : "outline"} className={`w-3.5 h-3.5 ${tab === t.key ? "" : t.color}`} />
            {t.label}
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
