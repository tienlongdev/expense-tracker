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

function toLocalDateValue(isoStr: string): string {
  const d = new Date(isoStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayDateValue(): string {
  return toLocalDateValue(new Date().toISOString());
}

function formatThousands(val: string): string {
  const digits = val.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("vi-VN");
}

function parseAmount(val: string): number {
  return Number(val.replace(/\./g, "").replace(/,/g, ""));
}

export default function SavingsAccountForm({
  account,
  onSubmit,
  onCancel,
  loading = false,
}: SavingsAccountFormProps) {
  const isEdit = !!account;
  const [name, setName]               = useState(account?.name ?? "");
  const [type, setType]               = useState<SavingsType>(account?.type ?? SavingsType.Savings);
  const [principalDisplay, setPrincipal] = useState(
    account?.totalDeposited ? formatThousands(account.totalDeposited.toString()) : ""
  );
  const [interestRate, setInterest]   = useState(account?.interestRate?.toString() ?? "");
  const [startDate, setStartDate]     = useState(
    account?.startDate ? toLocalDateValue(account.startDate) : todayDateValue()
  );
  const [maturityDate, setMaturity]   = useState(
    account?.maturityDate ? toLocalDateValue(account.maturityDate) : ""
  );
  const [note, setNote]               = useState(account?.note ?? "");
  const [errors, setErrors]           = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Tên tài khoản không được để trống";
    if (!isEdit && parseAmount(principalDisplay) <= 0)
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
        initialAmount: parseAmount(principalDisplay),
        interestRate: interestRate ? Number(interestRate) : undefined,
        startDate: new Date(startDate).toISOString(),
        maturityDate: maturityDate ? new Date(maturityDate).toISOString() : undefined,
        note: note.trim() || undefined,
      } as CreateSavingsAccountDto);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="sv-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Tên tài khoản
        </Label>
        <Input
          id="sv-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Tiết kiệm ngân hàng ACB"
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Type toggle */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Loại đầu tư
        </Label>
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

      {/* Principal — create only, prominent */}
      {!isEdit && (
        <div className="space-y-1.5">
          <Label htmlFor="sv-principal" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Vốn ban đầu
          </Label>
          <div className="relative">
            <Input
              id="sv-principal"
              inputMode="numeric"
              value={principalDisplay}
              onChange={(e) => setPrincipal(formatThousands(e.target.value))}
              placeholder="0"
              className={`h-12 text-lg font-semibold tabular-nums pr-14 ${errors.principal ? "border-destructive" : ""}`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
              VND
            </span>
          </div>
          {errors.principal && <p className="text-xs text-destructive">{errors.principal}</p>}
        </div>
      )}

      {/* Interest rate + dates — 2-column row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="sv-rate" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Lãi suất %/năm
          </Label>
          <div className="relative">
            <Input
              id="sv-rate"
              inputMode="decimal"
              value={interestRate}
              onChange={(e) => setInterest(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              className="pr-8 tabular-nums"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
          </div>
        </div>

        {!isEdit ? (
          <div className="space-y-1.5">
            <Label htmlFor="sv-start" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Ngày bắt đầu
            </Label>
            <Input
              id="sv-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="sv-maturity" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Ngày đáo hạn
            </Label>
            <Input
              id="sv-maturity"
              type="date"
              value={maturityDate}
              onChange={(e) => setMaturity(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Maturity date — create only (below 2-col row) */}
      {!isEdit && (
        <div className="space-y-1.5">
          <Label htmlFor="sv-maturity" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Ngày đáo hạn <span className="normal-case font-normal">(tùy chọn)</span>
          </Label>
          <Input
            id="sv-maturity"
            type="date"
            value={maturityDate}
            onChange={(e) => setMaturity(e.target.value)}
          />
        </div>
      )}

      {/* Note */}
      <div className="space-y-1.5">
        <Label htmlFor="sv-note" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Ghi chú <span className="normal-case font-normal">(tùy chọn)</span>
        </Label>
        <Textarea
          id="sv-note"
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
          {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo tài khoản"}
        </Button>
      </div>
    </form>
  );
}
