"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Budget, CreateBudgetDto, UpdateBudgetDto } from "@/types/budget";
import { Category } from "@/types/category";
import { useState } from "react";

interface BudgetFormProps {
  budget?: Budget;
  year: number;
  month: number;
  categories: Category[];
  onSubmit: (dto: CreateBudgetDto | UpdateBudgetDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

function formatThousands(val: string): string {
  const digits = val.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("vi-VN");
}

function parseAmount(val: string): number {
  return Number(val.replace(/\./g, "").replace(/,/g, ""));
}

export default function BudgetForm({
  budget,
  year,
  month,
  categories,
  onSubmit,
  onCancel,
  loading = false,
}: BudgetFormProps) {
  const [categoryId, setCategoryId] = useState(budget?.categoryId ?? "");
  const [amountDisplay, setAmountDisplay] = useState(
    budget?.plannedAmount ? formatThousands(budget.plannedAmount.toString()) : ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!budget && !categoryId) e.category = "Chọn danh mục";
    const amt = parseAmount(amountDisplay);
    if (!amountDisplay || amt <= 0) e.amount = "Ngân sách phải lớn hơn 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const plannedAmount = parseAmount(amountDisplay);
    if (budget) {
      await onSubmit({ plannedAmount } as UpdateBudgetDto);
    } else {
      await onSubmit({ categoryId, year, month, plannedAmount } as CreateBudgetDto);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Amount — prominent, at the top */}
      <div className="space-y-1.5">
        <Label htmlFor="budget-amount" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Ngân sách tháng {month}/{year}
          {budget && (
            <span className="ml-1.5 normal-case text-foreground font-semibold">
              — {budget.categoryName}
            </span>
          )}
        </Label>
        <div className="relative">
          <Input
            id="budget-amount"
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

      {/* Category — only for create */}
      {!budget && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Danh mục
          </Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className={errors.category ? "border-destructive" : ""}>
              <SelectValue placeholder="Chọn danh mục chi tiêu" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Hủy
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Đang lưu..." : budget ? "Cập nhật" : "Thêm ngân sách"}
        </Button>
      </div>
    </form>
  );
}
