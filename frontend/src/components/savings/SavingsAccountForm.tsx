"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    CreateSavingsAccountDto,
    SAVINGS_TYPE_LABELS,
    SavingsAccount,
    SavingsType,
    UpdateSavingsAccountDto,
} from "@/types/savings";
import { useState } from "react";

interface SavingsAccountFormProps {
  account?: SavingsAccount;
  onSubmit: (dto: CreateSavingsAccountDto | UpdateSavingsAccountDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function SavingsAccountForm({
  account,
  onSubmit,
  onCancel,
  loading = false,
}: SavingsAccountFormProps) {
  const isEdit = !!account;
  const [name, setName]             = useState(account?.name ?? "");
  const [type, setType]             = useState<SavingsType>(account?.type ?? SavingsType.Savings);
  const [principal, setPrincipal]   = useState(account?.principalAmount?.toString() ?? "");
  const [interestRate, setInterest] = useState(account?.interestRate?.toString() ?? "");
  const [startDate, setStartDate]   = useState(
    account?.startDate ? new Date(account.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [maturityDate, setMaturity] = useState(
    account?.maturityDate ? new Date(account.maturityDate).toISOString().split("T")[0] : ""
  );
  const [note, setNote]             = useState(account?.note ?? "");
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Tên tài khoản không được để trống";
    if (!isEdit && (!principal || Number(principal) <= 0))
      e.principal = "Số vốn ban đầu phải lớn hơn 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      await onSubmit({
        name: name.trim(),
        type,
        interestRate: interestRate ? Number(interestRate) : undefined,
        maturityDate: maturityDate ? new Date(maturityDate).toISOString() : undefined,
        note: note.trim() || undefined,
      } as UpdateSavingsAccountDto);
    } else {
      await onSubmit({
        name: name.trim(),
        type,
        principalAmount: Number(principal),
        interestRate: interestRate ? Number(interestRate) : undefined,
        startDate: new Date(startDate).toISOString(),
        maturityDate: maturityDate ? new Date(maturityDate).toISOString() : undefined,
        note: note.trim() || undefined,
      } as CreateSavingsAccountDto);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-1">
        <Label htmlFor="sv-name">Tên tài khoản</Label>
        <Input
          id="sv-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Tiết kiệm ngân hàng ACB"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Type */}
      <div className="space-y-1">
        <Label>Loại đầu tư</Label>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {Object.entries(SAVINGS_TYPE_LABELS).map(([k, label]) => (
            <button
              type="button"
              key={k}
              onClick={() => setType(Number(k) as SavingsType)}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                type === Number(k)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Principal (create only) */}
      {!isEdit && (
        <div className="space-y-1">
          <Label htmlFor="sv-principal">Vốn ban đầu (VND)</Label>
          <Input
            id="sv-principal"
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="0"
            min="0"
          />
          {errors.principal && <p className="text-xs text-destructive">{errors.principal}</p>}
        </div>
      )}

      {/* Interest rate */}
      <div className="space-y-1">
        <Label htmlFor="sv-rate">Lãi suất %/năm (tùy chọn)</Label>
        <Input
          id="sv-rate"
          type="number"
          value={interestRate}
          onChange={(e) => setInterest(e.target.value)}
          placeholder="0"
          min="0"
          step="0.01"
        />
      </div>

      {/* Start date (create only) */}
      {!isEdit && (
        <div className="space-y-1">
          <Label htmlFor="sv-start">Ngày bắt đầu</Label>
          <Input
            id="sv-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      )}

      {/* Maturity date */}
      <div className="space-y-1">
        <Label htmlFor="sv-maturity">Ngày đáo hạn (tùy chọn)</Label>
        <Input
          id="sv-maturity"
          type="date"
          value={maturityDate}
          onChange={(e) => setMaturity(e.target.value)}
        />
      </div>

      {/* Note */}
      <div className="space-y-1">
        <Label htmlFor="sv-note">Ghi chú (tùy chọn)</Label>
        <Textarea
          id="sv-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Thêm ghi chú..."
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo tài khoản"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Hủy
        </Button>
      </div>
    </form>
  );
}
