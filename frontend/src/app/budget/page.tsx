"use client";

import BudgetForm from "@/components/budget/BudgetForm";
import BudgetList from "@/components/budget/BudgetList";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useBudget } from "@/hooks/useBudget";
import { useCategories } from "@/hooks/useCategories";
import { formatCurrency } from "@/lib/format";
import { Budget, CopyBudgetDto, CreateBudgetDto, UpdateBudgetDto } from "@/types/budget";
import { TransactionType } from "@/types/transaction";
import Icon from "@/components/ui/Icon";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { useState } from "react";

export default function BudgetPage() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const {
    budgets,
    records,
    overview,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    copyFromMonth,
  } = useBudget(year, month);

  const { categories } = useCategories(TransactionType.Expense);

  const [dialog, setDialog]       = useState(false);
  const [editing, setEditing]     = useState<Budget | undefined>();
  const [mutating, setMutating]   = useState(false);
  const [mutError, setMutError]   = useState<string | null>(null);
  const [copyDialog, setCopyDialog] = useState(false);
  const [copyFrom, setCopyFrom]   = useState({ year: now.getFullYear(), month: now.getMonth() === 0 ? 12 : now.getMonth() });

  const navMonth = (dir: 1 | -1) => {
    let m = month + dir;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1)  { m = 12; y--; }
    setMonth(m);
    setYear(y);
  };

  const openCreate = () => { setEditing(undefined); setMutError(null); setDialog(true); };
  const openEdit   = (b: Budget) => { setEditing(b); setMutError(null); setDialog(true); };

  const handleSubmit = async (dto: CreateBudgetDto | UpdateBudgetDto) => {
    try {
      setMutating(true);
      setMutError(null);
      if (editing) {
        // editing is a Budget (BudgetStatusDto), find its record id via budgetId
        const id = editing.budgetId!;
        await updateBudget(id, dto as UpdateBudgetDto);
      } else {
        await createBudget(dto as CreateBudgetDto);
      }
      setDialog(false);
    } catch (err) {
      setMutError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteBudget(id); }
    catch (err) { alert(err instanceof Error ? err.message : "Không thể xóa ngân sách"); }
  };


  const handleCopy = async () => {
    try {
      setMutating(true);
      const dto: CopyBudgetDto = {
        fromYear:  copyFrom.year,
        fromMonth: copyFrom.month,
        toYear:    year,
        toMonth:   month,
        overwrite: false,
      };
      const result = await copyFromMonth(dto);
      alert(`${result.message ?? "Đã sao chép"} · Tạo mới: ${result.created} · Bỏ qua: ${result.skipped}`);
      setCopyDialog(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể sao chép ngân sách");
    } finally {
      setMutating(false);
    }
  };

  const MONTHS = ["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Ngân sách</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tháng {month}/{year}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Month navigation */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl px-1 py-1">
            <Button size="icon" className="h-7 w-7" variant="ghost" onClick={() => navMonth(-1)}>
              <Icon name="chevron-left" className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-2 min-w-[80px] text-center">
              {MONTHS[month - 1]} {year}
            </span>
            <Button size="icon" className="h-7 w-7" variant="ghost" onClick={() => navMonth(1)}>
              <Icon name="chevron-right" className="w-4 h-4" />
            </Button>
          </div>
          <Button size="sm" variant="outline" onClick={() => setCopyDialog(true)}>
            <Icon name="copy" className="w-4 h-4 mr-1" />
            Sao chép
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Icon name="plus" className="w-4 h-4 mr-1" />
            Thêm
          </Button>
        </div>
      </div>

      {/* Overview cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <SummaryCard
            title="Tổng kế hoạch"
            value={formatCurrency(overview.totalPlanned)}
            icon="book-open"
            theme="blue"
          />
          
          <SummaryCard
            title="Đã chi"
            value={formatCurrency(overview.totalSpent ?? 0)}
            icon="arrow-up-right"
            theme={(overview.totalSpent ?? 0) > overview.totalPlanned ? "rose" : "orange"}
          />
          
          <SummaryCard
            title="Còn lại"
            value={(overview.totalRemaining < 0 ? "\u2212" : "") + formatCurrency(Math.abs(overview.totalRemaining))}
            icon="chart-pie"
            theme={overview.totalRemaining < 0 ? "rose" : "emerald"}
          />
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <BudgetList
        budgets={budgets}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* Budget create/edit dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Sửa ngân sách" : `Thêm ngân sách — Tháng ${month}/${year}`}
            </DialogTitle>
          </DialogHeader>
          {mutError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{mutError}</div>
          )}
          <BudgetForm
            budget={editing}
            year={year}
            month={month}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={() => setDialog(false)}
            loading={mutating}
          />
        </DialogContent>
      </Dialog>

      {/* Copy dialog */}
      <Dialog open={copyDialog} onOpenChange={setCopyDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sao chép ngân sách</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Sao chép từ tháng nào sang tháng {month}/{year}?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Tháng nguồn</label>
                <select
                  value={copyFrom.month}
                  onChange={(e) => setCopyFrom((p) => ({ ...p, month: Number(e.target.value) }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Năm nguồn</label>
                <input
                  type="number"
                  value={copyFrom.year}
                  onChange={(e) => setCopyFrom((p) => ({ ...p, year: Number(e.target.value) }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  min={2020}
                  max={2100}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopy} disabled={mutating} className="flex-1">
                {mutating ? "Đang sao chép..." : "Sao chép"}
              </Button>
              <Button variant="outline" onClick={() => setCopyDialog(false)} className="flex-1">
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
