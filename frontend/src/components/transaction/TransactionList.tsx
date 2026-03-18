"use client";

import { Transaction } from "@/types/transaction";
import TransactionItem from "./TransactionItem";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit:   (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  loading = false,
}: TransactionListProps) {
  if (loading) return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i}
          className="h-20 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  );

  if (transactions.length === 0) return (
    <div className="text-center py-16 text-muted-foreground">
      <p className="text-4xl mb-3">📭</p>
      <p className="font-medium">No transactions found</p>
      <p className="text-sm">Add your first transaction!</p>
    </div>
  );

  return (
    <div className="space-y-2">
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