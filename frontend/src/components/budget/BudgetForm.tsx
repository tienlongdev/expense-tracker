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

export default function BudgetForm({
  budget,
  year,
  month,
  categories,
  onSubmit,
  onCancel,
  loading = false,
}: BudgetFormProps) {
  const [categoryId, setCategoryId]   = useState(budget?.categoryId ?? "");
  const [plannedAmount, setPlanned]   = useState(budget?.plannedAmount?.toString() ?? "");
  const [errors, setErrors]           = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!budget && !categoryId) e.category = "Chọn danh mục";
    if (!plannedAmount || Number(plannedAmount) <= 0)
      e.amount = "Ngân sách phải lớn hơn 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    if (budget) {
      await onSubmit({ plannedAmount: Number(plannedAmount) } as UpdateBudgetDto);
    } else {
      await onSubmit({
        categoryId,
        year,
        month,
        plannedAmount: Number(plannedAmount),
      } as CreateBudgetDto);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!budget && (
        <div className="space-y-1">
          <Label>Danh mục chi tiêu</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
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

      <div className="space-y-1">
        <Label htmlFor="budget-amount">
          Ngân sách tháng {month}/{year} (VND)
          {budget && <span className="text-muted-foreground ml-1">— {budget.categoryName}</span>}
        </Label>
        <Input
          id="budget-amount"
          type="number"
          value={plannedAmount}
          onChange={(e) => setPlanned(e.target.value)}
          placeholder="0"
          min="0"
        />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Đang lưu..." : budget ? "Cập nhật" : "Thêm ngân sách"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Hủy
        </Button>
      </div>
    </form>
  );
}
