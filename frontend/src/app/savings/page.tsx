"use client";

import SavingsAccountForm from "@/components/savings/SavingsAccountForm";
import SavingsAccountList from "@/components/savings/SavingsAccountList";
import SavingsTransactionForm, { SavingsTxType } from "@/components/savings/SavingsTransactionForm";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useSavings } from "@/hooks/useSavings";
import { formatCurrency } from "@/lib/format";
import { savingsApi } from "@/lib/savings-api";
import {
    CreateSavingsAccountDto,
    SavingsAccount,
    SavingsHistoryDto,
    SavingsStatus,
    UpdateSavingsAccountDto,
} from "@/types/savings";
import Icon from "@/components/ui/Icon";
import { useState } from "react";

export default function SavingsPage() {
  const {
    accounts,
    summary,
    loading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    deposit,
    withdraw,
    updateValue,
    addInterest,
    closeAccount,
  } = useSavings();

  const [accountDialog, setAccountDialog]   = useState(false);
  const [txDialog, setTxDialog]             = useState(false);
  const [historyDialog, setHistoryDialog]   = useState(false);
  const [editing, setEditing]               = useState<SavingsAccount | undefined>();
  const [activeTx, setActiveTx]             = useState<SavingsAccount | undefined>();
  const [txType, setTxType]                 = useState<SavingsTxType>("deposit");
  const [history, setHistory]               = useState<SavingsHistoryDto[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [mutating, setMutating]             = useState(false);
  const [mutError, setMutError]             = useState<string | null>(null);
  const [tab, setTab]                       = useState<"all" | "active" | "closed">("all");

  const openCreate = () => { setEditing(undefined); setMutError(null); setAccountDialog(true); };
  const openEdit   = (a: SavingsAccount) => { setEditing(a); setMutError(null); setAccountDialog(true); };

  const openTx = (a: SavingsAccount, type: SavingsTxType) => {
    setActiveTx(a);
    setTxType(type);
    setMutError(null);
    setTxDialog(true);
  };

  const openHistory = async (a: SavingsAccount) => {
    setHistoryLoading(true);
    setHistoryDialog(true);
    try {
      const data = await savingsApi.getHistory(a.id);
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAccountSubmit = async (dto: CreateSavingsAccountDto | UpdateSavingsAccountDto) => {
    try {
      setMutating(true);
      setMutError(null);
      if (editing) {
        await updateAccount(editing.id, dto as UpdateSavingsAccountDto);
      } else {
        await createAccount(dto as CreateSavingsAccountDto);
      }
      setAccountDialog(false);
    } catch (err) {
      setMutError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setMutating(false);
    }
  };

  const handleTxSubmit = async (data: {
    amount?: number;
    newValue?: number;
    date: string;
    note?: string;
  }) => {
    if (!activeTx) return;
    try {
      setMutating(true);
      setMutError(null);
      switch (txType) {
        case "deposit":       await deposit(activeTx.id, { amount: data.amount!, date: data.date, note: data.note }); break;
        case "withdraw":      await withdraw(activeTx.id, { amount: data.amount!, date: data.date, note: data.note }); break;
        case "update-value":  await updateValue(activeTx.id, { newValue: data.newValue!, date: data.date, note: data.note }); break;
        case "interest":      await addInterest(activeTx.id, { amount: data.amount!, date: data.date, note: data.note }); break;
      }
      setTxDialog(false);
    } catch (err) {
      setMutError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setMutating(false);
    }
  };

  const handleClose = async (a: SavingsAccount) => {
    if (!confirm(`Đóng tài khoản "${a.name}"?`)) return;
    try {
      await closeAccount(a.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể đóng tài khoản");
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteAccount(id); }
    catch (err) { alert(err instanceof Error ? err.message : "Không thể xóa tài khoản"); }
  };

  const filtered =
    tab === "active"
      ? accounts.filter((a) => a.status === SavingsStatus.Active)
      : tab === "closed"
      ? accounts.filter((a) => a.status !== SavingsStatus.Active)
      : accounts;

  const TX_TITLES: Record<SavingsTxType, string> = {
    deposit:        "Nạp thêm vốn",
    withdraw:       "Rút vốn",
    "update-value": "Cập nhật giá trị",
    interest:       "Ghi nhận nhận lãi",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Tiết kiệm & Đầu tư</h1>
          <p className="text-sm text-muted-foreground mt-1">{accounts.length} tài khoản</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Icon name="plus" className="w-4 h-4 mr-1" />
          Thêm tài khoản
        </Button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl overflow-hidden ring-1 ring-border/40 border-transparent bg-card shadow-sm transition-all duration-200 hover:ring-border">
            <div className="h-0.5 bg-blue-500" />
            <div className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tổng vốn</p>
              <p className="text-lg font-bold tabular-nums mt-0.5">{formatCurrency(summary.totalPrincipal)}</p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden ring-1 ring-border/40 border-transparent bg-card shadow-sm transition-all duration-200 hover:ring-border">
            <div className="h-0.5 bg-indigo-500" />
            <div className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Giá trị hiện tại</p>
              <p className="text-lg font-bold tabular-nums mt-0.5">{formatCurrency(summary.totalCurrentValue)}</p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden ring-1 ring-border/40 border-transparent bg-card shadow-sm transition-all duration-200 hover:ring-border">
            <div className={`h-0.5 ${summary.totalProfitLoss >= 0 ? "bg-green-500" : "bg-red-500"}`} />
            <div className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lời / Lỗ</p>
              <p className={`text-lg font-bold tabular-nums mt-0.5 ${summary.totalProfitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                {summary.totalProfitLoss >= 0 ? "+" : "\u2212"}{formatCurrency(Math.abs(summary.totalProfitLoss))}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {summary.profitLossPercentage >= 0 ? "+" : "\u2212"}{Math.abs(summary.profitLossPercentage ?? 0).toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden ring-1 ring-border/40 border-transparent bg-card shadow-sm transition-all duration-200 hover:ring-border">
            <div className="h-0.5 bg-emerald-500" />
            <div className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Đang hoạt động</p>
              <p className="text-lg font-bold tabular-nums mt-0.5">
                {summary.activeCount} <span className="text-sm font-normal text-muted-foreground">/ {summary.totalCount}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(["all", "active", "closed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t === "all" ? "Tất cả" : t === "active" ? "Đang hoạt động" : "Đã đóng"}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <SavingsAccountList
        accounts={filtered}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        onDeposit={(a) => openTx(a, "deposit")}
        onWithdraw={(a) => openTx(a, "withdraw")}
        onUpdateValue={(a) => openTx(a, "update-value")}
        onInterest={(a) => openTx(a, "interest")}
        onHistory={openHistory}
        onClose={handleClose}
      />

      {/* Account create/edit dialog */}
      <Dialog open={accountDialog} onOpenChange={setAccountDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa tài khoản" : "Thêm tài khoản"}</DialogTitle>
          </DialogHeader>
          {mutError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{mutError}</div>
          )}
          <SavingsAccountForm
            account={editing}
            onSubmit={handleAccountSubmit}
            onCancel={() => setAccountDialog(false)}
            loading={mutating}
          />
        </DialogContent>
      </Dialog>

      {/* Transaction dialog */}
      <Dialog open={txDialog} onOpenChange={setTxDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {TX_TITLES[txType]} — {activeTx?.name}
            </DialogTitle>
          </DialogHeader>
          {mutError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{mutError}</div>
          )}
          {activeTx && (
            <SavingsTransactionForm
              txType={txType}
              currentValue={activeTx.currentValue}
              onSubmit={handleTxSubmit}
              onCancel={() => setTxDialog(false)}
              loading={mutating}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* History dialog */}
      <Dialog open={historyDialog} onOpenChange={setHistoryDialog}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lịch sử giao dịch</DialogTitle>
          </DialogHeader>
          {historyLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Chưa có giao dịch nào</p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg ring-1 ring-border/60 bg-card"
                >
                  <div>
                    <p className="text-xs font-medium">{h.transactionType}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.date).toLocaleDateString("vi-VN")}
                      {h.note && ` · ${h.note}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold tabular-nums">{formatCurrency(h.amount)}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      → {formatCurrency(h.currentValueAfter)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
