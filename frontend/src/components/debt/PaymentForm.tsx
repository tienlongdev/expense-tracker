"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import { CreateDebtPaymentDto } from "@/types/debt";
import { useState } from "react";

interface PaymentFormProps {
  maxAmount: number;
  onSubmit: (dto: CreateDebtPaymentDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

function toLocalDateValue(): string {
  const d = new Date();
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

export default function PaymentForm({
  maxAmount,
  onSubmit,
  onCancel,
  loading = false,
}: PaymentFormProps) {
  const [amountDisplay, setAmountDisplay] = useState("");
  const [date, setDate]   = useState(toLocalDateValue());
  const [note, setNote]   = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    const n = parseAmount(amountDisplay);
    if (n <= 0)        e.amount = "Số tiền phải lớn hơn 0";
    if (n > maxAmount) e.amount = `Không vượt quá ${formatCurrency(maxAmount)}`;
    if (!date)         e.date   = "Ngày không được để trống";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSubmit({
      amount: parseAmount(amountDisplay),
      date:   new Date(date).toISOString(),
      note:   note.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Remaining balance info */}
      <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5">
        <span className="text-xs text-muted-foreground">Số tiền còn nợ</span>
        <span className="text-sm font-semibold tabular-nums">{formatCurrency(maxAmount)}</span>
      </div>

      {/* Amount — prominent */}
      <div className="space-y-1.5">
        <Label htmlFor="pay-amount" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Số tiền thanh toán
        </Label>
        <div className="relative">
          <Input
            id="pay-amount"
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
        <Label htmlFor="pay-date" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Ngày thanh toán
        </Label>
        <Input
          id="pay-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={errors.date ? "border-destructive" : ""}
        />
        {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <Label htmlFor="pay-note" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Ghi chú <span className="normal-case font-normal">(tùy chọn)</span>
        </Label>
        <Textarea
          id="pay-note"
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
          {loading ? "Đang lưu..." : "Ghi nhận thanh toán"}
        </Button>
      </div>
    </form>
  );
}


interface PaymentFormProps {
  maxAmount: number;
  onSubmit: (dto: CreateDebtPaymentDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}


