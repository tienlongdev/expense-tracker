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
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/useCategories";
import {
  CreateTransactionDto,
  Transaction,
  TransactionType,
  UpdateTransactionDto,
} from "@/types/transaction";
import { useState } from "react";

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: CreateTransactionDto | UpdateTransactionDto) => Promise<void>;
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

export default function TransactionForm({
  transaction,
  onSubmit,
  onCancel,
  loading = false,
}: TransactionFormProps) {
  const [title, setTitle]       = useState(transaction?.title ?? "");
  const [amountDisplay, setAmountDisplay] = useState(
    transaction?.amount ? formatThousands(transaction.amount.toString()) : ""
  );
  const [type, setType]         = useState<TransactionType>(
    transaction?.type ?? TransactionType.Expense
  );
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? "");
  const [date, setDate]         = useState(
    transaction?.date
      ? new Date(transaction.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [note, setNote]         = useState(transaction?.note ?? "");
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const { categories, loading: catLoading } = useCategories(type);

  const isExpense = type === TransactionType.Expense;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountDisplay(formatThousands(e.target.value));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim())              newErrors.title    = "Vui lòng nhập tiêu đề";
    const parsed = parseAmount(amountDisplay);
    if (!amountDisplay || parsed <= 0) newErrors.amount = "Số tiền phải lớn hơn 0";
    if (!categoryId)                newErrors.category = "Vui lòng chọn danh mục";
    if (!date)                      newErrors.date     = "Vui lòng chọn ngày";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      title:      title.trim(),
      amount:     parseAmount(amountDisplay),
      type,
      categoryId,
      date:       new Date(date).toISOString(),
      note:       note.trim() || undefined,
    });
  };

  const accentColor = isExpense ? "red" : "green";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Type Toggle */}
      <div className="flex rounded-xl overflow-hidden border border-border p-1 gap-1 bg-muted/40">
        <button
          type="button"
          onClick={() => { setType(TransactionType.Income); setCategoryId(""); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
            ${!isExpense
              ? "bg-green-500 text-white shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
        >
          <span className="text-base">↑</span> Thu nhập
        </button>
        <button
          type="button"
          onClick={() => { setType(TransactionType.Expense); setCategoryId(""); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
            ${isExpense
              ? "bg-red-500 text-white shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
        >
          <span className="text-base">↓</span> Chi tiêu
        </button>
      </div>

      {/* Amount — prominent */}
      <div className={`rounded-xl border-2 px-4 py-3 bg-muted/30 transition-colors
        ${errors.amount
          ? "border-destructive"
          : isExpense ? "border-red-500/40 focus-within:border-red-500" : "border-green-500/40 focus-within:border-green-500"}`}>
        <p className="text-xs text-muted-foreground mb-1 font-medium">Số tiền (VND)</p>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${isExpense ? "text-red-500" : "text-green-500"}`}>
            {isExpense ? "−" : "+"}
          </span>
          <input
            id="amount"
            inputMode="numeric"
            value={amountDisplay}
            onChange={handleAmountChange}
            placeholder="0"
            className="flex-1 bg-transparent text-2xl font-bold tracking-wide outline-none placeholder:text-muted-foreground/40"
          />
          <span className="text-sm text-muted-foreground font-medium">₫</span>
        </div>
        {errors.amount && (
          <p className="text-xs text-destructive mt-1">{errors.amount}</p>
        )}
      </div>

      {/* Title + Category row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Tiêu đề
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề..."
            className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Danh mục
          </Label>
          <Select value={categoryId} onValueChange={setCategoryId} disabled={catLoading}>
            <SelectTrigger className={errors.category ? "border-destructive focus:ring-destructive" : ""}>
              <SelectValue placeholder={catLoading ? "Đang tải..." : "Chọn danh mục"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category}</p>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <Label htmlFor="date" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Ngày
        </Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={errors.date ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        {errors.date && (
          <p className="text-xs text-destructive">{errors.date}</p>
        )}
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <Label htmlFor="note" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Ghi chú <span className="normal-case font-normal">(tuỳ chọn)</span>
        </Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Thêm ghi chú..."
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <Button
          type="submit"
          disabled={loading}
          className={`flex-1 font-semibold ${isExpense
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-green-500 hover:bg-green-600 text-white"}`}
        >
          {loading
            ? "Đang lưu..."
            : transaction
              ? "Cập nhật"
              : isExpense ? "Thêm chi tiêu" : "Thêm thu nhập"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Huỷ
        </Button>
      </div>

    </form>
  );
}