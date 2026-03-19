"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export type SavingsTxType = "deposit" | "withdraw" | "update-value" | "interest";

interface SavingsTransactionFormProps {
  txType: SavingsTxType;
  currentValue: number;
  onSubmit: (data: { amount?: number; newValue?: number; date: string; note?: string }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const TX_CONFIG: Record<SavingsTxType, { label: string; amountLabel: string; placeholder: string; useNewValue?: boolean }> = {
  deposit:       { label: "Nạp thêm vốn",        amountLabel: "Số tiền nạp (VND)",    placeholder: "0" },
  withdraw:      { label: "Rút vốn",              amountLabel: "Số tiền rút (VND)",    placeholder: "0" },
  "update-value":{ label: "Cập nhật giá trị",     amountLabel: "Giá trị mới (VND)",    placeholder: "0", useNewValue: true },
  interest:      { label: "Ghi nhận nhận lãi",    amountLabel: "Tiền lãi nhận được (VND)", placeholder: "0" },
};

export default function SavingsTransactionForm({
  txType,
  currentValue,
  onSubmit,
  onCancel,
  loading = false,
}: SavingsTransactionFormProps) {
  const config = TX_CONFIG[txType];
  const [amount, setAmount]  = useState("");
  const [date, setDate]      = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote]      = useState("");
  const [errors, setErrors]  = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!amount || Number(amount) <= 0) e.amount = "Số tiền phải lớn hơn 0";
    if (!date) e.date = "Ngày không được để trống";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...(config.useNewValue ? { newValue: Number(amount) } : { amount: Number(amount) }),
      date: new Date(date).toISOString(),
      note: note.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {txType === "update-value" && (
        <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
          Giá trị hiện tại: <span className="font-semibold text-foreground">{currentValue.toLocaleString("vi-VN")} đ</span>
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="sv-tx-amount">{config.amountLabel}</Label>
        <Input
          id="sv-tx-amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={config.placeholder}
          min="0"
        />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="sv-tx-date">Ngày giao dịch</Label>
        <Input
          id="sv-tx-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="sv-tx-note">Ghi chú (tùy chọn)</Label>
        <Textarea
          id="sv-tx-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Thêm ghi chú..."
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Đang lưu..." : config.label}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Hủy
        </Button>
      </div>
    </form>
  );
}
