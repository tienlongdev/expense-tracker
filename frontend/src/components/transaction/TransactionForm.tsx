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

const CATEGORIES = {
  [TransactionType.Income]: [
    "Salary", "Freelance", "Investment", "Gift", "Other Income",
  ],
  [TransactionType.Expense]: [
    "Food", "Housing", "Transport", "Utilities",
    "Healthcare", "Education", "Entertainment", "Shopping", "Other Expense",
  ],
};

export default function TransactionForm({
  transaction,
  onSubmit,
  onCancel,
  loading = false,
}: TransactionFormProps) {
  const [title, setTitle]       = useState(transaction?.title ?? "");
  const [amount, setAmount]     = useState(transaction?.amount?.toString() ?? "");
  const [type, setType]         = useState<TransactionType>(
    transaction?.type ?? TransactionType.Expense
  );
  const [category, setCategory] = useState(transaction?.category ?? "");
  const [date, setDate]         = useState(
    transaction?.date
      ? new Date(transaction.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [note, setNote]         = useState(transaction?.note ?? "");
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim())        newErrors.title    = "Title is required";
    if (!amount || Number(amount) <= 0)
                              newErrors.amount   = "Amount must be greater than 0";
    if (!category)            newErrors.category = "Category is required";
    if (!date)                newErrors.date     = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      title:    title.trim(),
      amount:   Number(amount),
      type,
      category,
      date:     new Date(date).toISOString(),
      note:     note.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Type Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button type="button"
          onClick={() => { setType(TransactionType.Income); setCategory(""); }}
          className={`py-2 rounded-lg font-medium transition-colors
            ${type === TransactionType.Income
              ? "bg-green-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
          ↑ Income
        </button>
        <button type="button"
          onClick={() => { setType(TransactionType.Expense); setCategory(""); }}
          className={`py-2 rounded-lg font-medium transition-colors
            ${type === TransactionType.Expense
              ? "bg-red-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
          ↓ Expense
        </button>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Monthly Salary" />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-1">
        <Label htmlFor="amount">Amount (VND)</Label>
        <Input id="amount" type="number" value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 5000000" min="0" />
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES[type].map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-1">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" value={date}
          onChange={(e) => setDate(e.target.value)} />
        {errors.date && (
          <p className="text-xs text-destructive">{errors.date}</p>
        )}
      </div>

      {/* Note */}
      <div className="space-y-1">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea id="note" value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note..." rows={2} />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : transaction ? "Update" : "Add Transaction"}
        </Button>
        <Button type="button" variant="outline"
          onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>

    </form>
  );
}