"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateDebtDto, Debt, DebtType, UpdateDebtDto } from "@/types/debt";
import { useState } from "react";

interface DebtFormProps {
  debt?: Debt;
  onSubmit: (dto: CreateDebtDto | UpdateDebtDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

function toLocalDateValue(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatThousands(val: string): string {
  const digits = val.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("vi-VN");
}

function parseAmount(val: string): number {
  return Number(val.replace(/\./g, "").replace(/,/g, ""));
}

export default function DebtForm({ debt, onSubmit, onCancel, loading = false }: DebtFormProps) {
  const [title, setTitle]           = useState(debt?.title ?? "");
  const [personName, setPersonName] = useState(debt?.personName ?? "");
  const [amountDisplay, setAmountDisplay] = useState(
    debt?.amount ? formatThousands(debt.amount.toString()) : ""
  );
  const [type, setType]     = useState<DebtType>(debt?.type ?? DebtType.Borrowed);
  const [dueDate, setDueDate] = useState(
    debt?.dueDate ? toLocalDateValue(debt.dueDate) : ""
  );
  const [note, setNote]     = useState(debt?.note ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim())              e.title      = "Tên khoản nợ không được để trống";
    if (!personName.trim())         e.personName = "Tên người không được để trống";
    if (parseAmount(amountDisplay) <= 0) e.amount = "Số tiền phải lớn hơn 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSubmit({
      title:      title.trim(),
      personName: personName.trim(),
      amount:     parseAmount(amountDisplay),
      type,
      dueDate:    dueDate ? new Date(dueDate).toISOString() : undefined,
      note:       note.trim() || undefined,
    });
  };

  const isBorrowed = type === DebtType.Borrowed;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Type toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType(DebtType.Borrowed)}
          className={`py-2 rounded-lg font-medium text-sm transition-colors ${
            isBorrowed
              ? "bg-red-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          📥 Tôi đang vay
        </button>
        <button
          type="button"
          onClick={() => setType(DebtType.Lent)}
          className={`py-2 rounded-lg font-medium text-sm transition-colors ${
            !isBorrowed
              ? "bg-blue-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          📤 Tôi cho mượn
        </button>
      </div>

      {/* Amount — prominent */}
      <div className="space-y-1.5">
        <Label htmlFor="debt-amount" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Số tiền
        </Label>
        <div className="relative">
          <Input
            id="debt-amount"
            inputMode="numeric"
            value={amountDisplay}
            onChange={(e) => setAmountDisplay(formatThousands(e.target.value))}
            placeholder="0"
            className={`h-12 text-lg font-semibold tabular-nums pr-14 ${errors.amount ? "border-destructive" : ""}`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
            VND
          </span>
        </div>
        {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
      </div>

      {/* Title + Person — 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="debt-title" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tiêu đề
          </Label>
          <Input
            id="debt-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Vay tiền mua xe"
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="debt-person" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {isBorrowed ? "Người cho vay" : "Người vay"}
          </Label>
          <Input
            id="debt-person"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="Tên người"
            className={errors.personName ? "border-destructive" : ""}
          />
          {errors.personName && <p className="text-xs text-destructive">{errors.personName}</p>}
        </div>
      </div>

      {/* Due date */}
      <div className="space-y-1.5">
        <Label htmlFor="debt-due" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Hạn trả <span className="normal-case font-normal">(tùy chọn)</span>
        </Label>
        <Input
          id="debt-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <Label htmlFor="debt-note" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Ghi chú <span className="normal-case font-normal">(tùy chọn)</span>
        </Label>
        <Textarea
          id="debt-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Thêm ghi chú..."
          rows={2}
          className="resize-none text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Hủy
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Đang lưu..." : debt ? "Cập nhật" : "Thêm khoản nợ"}
        </Button>
      </div>
    </form>
  );
}

