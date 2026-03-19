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

export default function DebtForm({ debt, onSubmit, onCancel, loading = false }: DebtFormProps) {
  const [title, setTitle]           = useState(debt?.title ?? "");
  const [personName, setPersonName] = useState(debt?.personName ?? "");
  const [amount, setAmount]         = useState(debt?.amount?.toString() ?? "");
  const [type, setType]             = useState<DebtType>(debt?.type ?? DebtType.Borrowed);
  const [dueDate, setDueDate]       = useState(
    debt?.dueDate ? new Date(debt.dueDate).toISOString().split("T")[0] : ""
  );
  const [note, setNote]             = useState(debt?.note ?? "");
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim())        e.title      = "Tên khoản nợ không được để trống";
    if (!personName.trim())   e.personName = "Tên người không được để trống";
    if (!amount || Number(amount) <= 0) e.amount = "Số tiền phải lớn hơn 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSubmit({
      title:      title.trim(),
      personName: personName.trim(),
      amount:     Number(amount),
      type,
      dueDate:    dueDate ? new Date(dueDate).toISOString() : undefined,
      note:       note.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Debt type toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType(DebtType.Borrowed)}
          className={`py-2 rounded-lg font-medium text-sm transition-colors ${
            type === DebtType.Borrowed
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
            type === DebtType.Lent
              ? "bg-blue-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          📤 Tôi cho mượn
        </button>
      </div>

      <div className="space-y-1">
        <Label htmlFor="debt-title">Tiêu đề</Label>
        <Input
          id="debt-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ví dụ: Vay tiền mua xe"
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="debt-person">
          {type === DebtType.Borrowed ? "Người cho vay" : "Người vay"}
        </Label>
        <Input
          id="debt-person"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder="Tên người"
        />
        {errors.personName && <p className="text-xs text-destructive">{errors.personName}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="debt-amount">Số tiền (VND)</Label>
        <Input
          id="debt-amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          min="0"
        />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="debt-due">Hạn trả (tùy chọn)</Label>
        <Input
          id="debt-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="debt-note">Ghi chú (tùy chọn)</Label>
        <Textarea
          id="debt-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Thêm ghi chú..."
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Đang lưu..." : debt ? "Cập nhật" : "Thêm khoản nợ"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Hủy
        </Button>
      </div>
    </form>
  );
}
