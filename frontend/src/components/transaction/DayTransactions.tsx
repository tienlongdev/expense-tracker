"use client";

import { formatCurrency, formatDate } from "@/lib/format";
import { Transaction, TransactionType } from "@/types/transaction";
import Icon from "@/components/ui/Icon";

interface DayTransactionsProps {
  date: Date;
  transactions: Transaction[];
  loading?: boolean;
}

export default function DayTransactions({
  date,
  transactions,
  loading = false,
}: DayTransactionsProps) {
  const totalIncome = transactions
    .filter((t) => t.type === TransactionType.Income)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === TransactionType.Expense)
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/40 bg-card">
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
            <div className="h-2.5 w-1/5 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-3 w-16 rounded bg-muted animate-pulse shrink-0" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">

      {/* Date Header */}
      <div className="flex items-center justify-between pb-1 border-b border-border/50">
        <h3 className="font-semibold text-sm text-foreground">
          {formatDate(date.toISOString())}
        </h3>
        <div className="flex items-center gap-3 text-xs font-semibold tabular-nums">
          {totalIncome > 0 && (
            <span className="text-green-500">+{formatCurrency(totalIncome)}</span>
          )}
          {totalExpense > 0 && (
            <span className="text-red-500">−{formatCurrency(totalExpense)}</span>
          )}
        </div>
      </div>

      {/* Transactions */}
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
            <Icon name="calendar" className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground/50">Không có giao dịch nào</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {transactions.map((t) => {
            const isIncome = t.type === TransactionType.Income;
            return (
              <div key={t.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/50 bg-card hover:border-border hover:shadow-sm transition-all duration-150">
                {/* Icon */}
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  ${isIncome ? "bg-green-500/15 text-green-500" : "bg-red-500/15 text-red-500"}`}>
                  {isIncome ? "↑" : "↓"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium mt-0.5
                    ${isIncome ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                    {t.categoryName ?? t.category}
                  </span>
                </div>

                {/* Amount */}
                <span className={`shrink-0 text-sm font-bold tabular-nums
                  ${isIncome ? "text-green-500" : "text-red-500"}`}>
                  {isIncome ? "+" : "−"}{formatCurrency(t.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
