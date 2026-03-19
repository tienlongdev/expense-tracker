"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import { useState } from "react";

export type SavingsTxType = "deposit" | "withdraw" | "update-value" | "interest";

interface SavingsTransactionFormProps {
  txType: SavingsTxType;
  currentValue: number;
  onSubmit: (data: { amount?: number; newValue?: number; date: string; note?: string }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const TX_CONFIG: Record<SavingsTxType, {
  label: string;
  amountLabel: string;
  accentColor: string;
  useNewValue?: boolean;
}> = {
  deposit:        { label: "Nạp thêm vốn",       amountLabel: "Số tiền nạp",        accentColor: "bg-green-500" },
  withdraw:       { label: "Rút vốn",             amountLabel: "Số tiền rút",        accentColor: "bg-red-500" },
  "update-value": { label: "Cập nhật giá trị",    amountLabel: "Giá trị mới",        accentColor: "bg-blue-500", useNewValue: true },
  interest:       { label: "Ghi nhận nhận lãi",   amountLabel: "Tiền lãi nhận được", accentColor: "bg-yellow-500" },
};

function toLocalDateValue(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatThousands(val: string): string {
  const digits = val.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("vi-VN");
}

function parseAmount(val: string): number {
  return Number(val.replace(/\./g, "").replace(/,/g, ""));
}

export default function SavingsTransactionForm({
  txType,
  currentValue,
  onSubmit,
  onCancel,
  loading = false,
}: SavingsTransactionFormProps) {
  const config = TX_CONFIG[txType];
  const [amountDisplay, setAmountDisplay] = useState("");
  const [date, setDate]   = useState(toLocalDateValue());
  const [note, setNote]   = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (parseAmount(amountDisplay) <= 0) e.amount = "Số tiền phải lớn hơn 0";
    if (!date) e.date = "Ngày không được để trống";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const amt = parseAmount(amountDisplay);
    await onSubmit({
      ...(config.useNewValue ? { newValue: amt } : { amount: amt }),
      date: new Date(date).toISOString(),
      note: note.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Current value info for update-value mode */}
      {txType === "update-value" && (
        <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5">
          <span className="text-xs text-muted-foreground">Giá trị hiện tại</span>
          <span className="text-sm font-semibold tabular-nums">{formatCurrency(currentValue)}</span>
        </div>
      )}

      {/* Amount — prominent */}
      <div className="space-y-1.5">
        <Label htmlFor="sv-tx-amount" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {config.amountLabel}
        </Label>
        <div className="relative">
          <Input
            id="sv-tx-amount"
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

      {/* Date */}
      <div className="space-y-1.5">
        <Label htmlFor="sv-tx-date" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Ngày giao dịch
        </Label>
        <Input
          id="sv-tx-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={errors.date ? "border-destructive" : ""}
        />
        {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <Label htmlFor="sv-tx-note" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Ghi chú <span className="normal-case font-normal">(tùy chọn)</span>
        </Label>
        <Textarea
          id="sv-tx-note"
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
        <Button type="submit" disabled={loading} className={`flex-1 ${config.accentColor === "bg-red-500" ? "bg-red-500 hover:bg-red-600" : ""}`}>
          {loading ? "Đang lưu..." : config.label}
        </Button>
      </div>
    </form>
  );
}

