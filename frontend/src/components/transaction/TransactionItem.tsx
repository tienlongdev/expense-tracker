"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import { Transaction, TransactionType } from "@/types/transaction";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface TransactionItemProps {
  transaction: Transaction;
  onEdit:   (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionItem({
  transaction,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isIncome = transaction.type === TransactionType.Income;

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">

      {/* Left — Icon + Info */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg
          ${isIncome ? "bg-green-500" : "bg-red-500"}`}>
          {isIncome ? "↑" : "↓"}
        </div>
        <div>
          <p className="font-medium">{transaction.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="text-xs">
              {transaction.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDate(transaction.date)}
            </span>
          </div>
          {transaction.note && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {transaction.note}
            </p>
          )}
        </div>
      </div>

      {/* Right — Amount + Actions */}
      <div className="flex items-center gap-3">
        <span className={`font-bold text-lg
          ${isIncome ? "text-green-500" : "text-red-500"}`}>
          {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
        </span>

        {!confirmDelete ? (
          <div className="flex gap-1">
            <Button size="icon" variant="ghost"
              onClick={() => onEdit(transaction)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost"
              onClick={() => setConfirmDelete(true)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-1">
            <Button size="sm" variant="destructive"
              onClick={() => onDelete(transaction.id)}>
              Confirm
            </Button>
            <Button size="sm" variant="outline"
              onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}