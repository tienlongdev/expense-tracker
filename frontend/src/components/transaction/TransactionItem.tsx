"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";
import { formatCurrency, formatDate } from "@/lib/format";
import { Transaction, TransactionType } from "@/types/transaction";
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
    <div className="group flex items-center gap-4 px-4 py-3 rounded-xl border border-border/50 bg-card hover:border-border hover:shadow-md transition-all duration-200">
      {/* Gradient icon */}
      <div
        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110
          ${isIncome
            ? "bg-gradient-to-br from-emerald-400/20 to-emerald-600/10"
            : "bg-gradient-to-br from-rose-400/20 to-rose-600/10"
          }`}
      >
        <Icon
          name={isIncome ? "arrow-up" : "arrow-down"}
          variant="solid"
          className={`w-4 h-4 ${isIncome ? "text-emerald-500" : "text-rose-500"}`}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{transaction.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium
            ${isIncome ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
            {transaction.categoryName ?? transaction.category}
          </span>
          <span className="text-[11px] text-muted-foreground">{formatDate(transaction.date)}</span>
          {transaction.note && (
            <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
              · {transaction.note}
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <span className={`shrink-0 font-bold text-sm tabular-nums
        ${isIncome ? "text-green-500" : "text-red-500"}`}>
        {isIncome ? "+" : "−"}{formatCurrency(transaction.amount)}
      </span>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1">
        {!confirmDelete ? (
          <>
            <Button size="icon" variant="ghost" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-all hover:scale-110" onClick={() => onEdit(transaction)}>
              <Icon name="pencil" className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
            <Button size="icon" variant="ghost" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-150">
            <span className="text-xs text-muted-foreground mr-1">Xoá?</span>
            <Button size="sm" variant="destructive" className="h-7 px-2.5 text-xs" onClick={() => onDelete(transaction.id)}>
              Xoá
            </Button>
            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => setConfirmDelete(false)}>
              Huỷ
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
