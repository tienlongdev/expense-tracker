"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Category, CreateCategoryDto, UpdateCategoryDto } from "@/types/category";
import { TransactionType } from "@/types/transaction";
import { useState } from "react";

interface CategoryFormProps {
  category?: Category;
  onSubmit: (dto: CreateCategoryDto | UpdateCategoryDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function CategoryForm({
  category,
  onSubmit,
  onCancel,
  loading = false,
}: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState<TransactionType>(
    category?.type ?? TransactionType.Expense
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Tên danh mục không được để trống";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSubmit({ name: name.trim(), type });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type */}
      <div className="space-y-1">
        <Label>Loại</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType(TransactionType.Income)}
            className={`py-2 rounded-lg font-medium transition-colors text-sm ${
              type === TransactionType.Income
                ? "bg-green-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            ↑ Thu nhập
          </button>
          <button
            type="button"
            onClick={() => setType(TransactionType.Expense)}
            className={`py-2 rounded-lg font-medium transition-colors text-sm ${
              type === TransactionType.Expense
                ? "bg-red-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            ↓ Chi tiêu
          </button>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-1">
        <Label htmlFor="cat-name">Tên danh mục</Label>
        <Input
          id="cat-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Ăn uống"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Đang lưu..." : category ? "Cập nhật" : "Thêm danh mục"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Hủy
        </Button>
      </div>
    </form>
  );
}
