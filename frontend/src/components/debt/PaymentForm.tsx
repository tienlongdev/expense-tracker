"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateDebtPaymentDto } from "@/types/debt";
import { useState } from "react";

interface PaymentFormProps {
  maxAmount: number;
  onSubmit: (dto: CreateDebtPaymentDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function PaymentForm({
  maxAmount,
  onSubmit,
  onCancel,
  loading = false,
}: PaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [date, setDate]     = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote]     = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    const n = Number(amount);
    if (!amount || n <= 0)       e.amount = "Số tiền phải lớn hơn 0";
    if (n > maxAmount)           e.amount = `Không vượt quá ${maxAmount.toLocaleString("vi-VN")} đ`;
    if (!date)                   e.date   = "Ngày không được để trống";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSubmit({
      amount: Number(amount),
      date:   new Date(date).toISOString(),
      note:   note.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="pay-amount">
          Số tiền (còn nợ: {maxAmount.toLocaleString("vi-VN")} đ)
        </Label>
        <Input
          id="pay-amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          min="1"
          max={maxAmount}
        />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="pay-date">Ngày thanh toán</Label>
        <Input
          id="pay-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="pay-note">Ghi chú (tùy chọn)</Label>
        <Textarea
          id="pay-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Thêm ghi chú..."
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Đang lưu..." : "Ghi nhận thanh toán"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Hủy
        </Button>
      </div>
    </form>
  );
}
