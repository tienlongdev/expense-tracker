"use client";

import { Transaction } from "@/types/transaction";
import TransactionItem from "./TransactionItem";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit:   (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

function SkeletonItem() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border/40 bg-card">
      <div className="w-9 h-9 rounded-full bg-muted animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-2/5 rounded bg-muted animate-pulse" />
        <div className="h-2.5 w-1/3 rounded bg-muted animate-pulse" />
      </div>
      <div className="h-3.5 w-20 rounded bg-muted animate-pulse shrink-0" />
    </div>
  );
}

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  loading = false,
}: TransactionListProps) {
  if (loading) return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => <SkeletonItem key={i} />)}
    </div>
  );

  if (transactions.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <p className="text-5xl mb-4">📭</p>
      <p className="font-semibold text-foreground">Chưa có giao dịch nào</p>
      <p className="text-sm mt-1">Nhấn &ldquo;+ Thêm&rdquo; để thêm giao dịch đầu tiên!</p>
    </div>
  );

  return (
    <div className="space-y-1.5">
      {transactions.map((t) => (
        <TransactionItem
          key={t.id}
          transaction={t}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
