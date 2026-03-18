"use client";

import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { Transaction, TransactionType } from "@/types/transaction";

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
        <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="space-y-3">

      {/* Date Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{formatDate(date.toISOString())}</h3>
        <div className="flex gap-2 text-sm">
          {totalIncome > 0 && (
            <span className="text-green-500 font-medium">
              +{formatCurrency(totalIncome)}
            </span>
          )}
          {totalExpense > 0 && (
            <span className="text-red-500 font-medium">
              -{formatCurrency(totalExpense)}
            </span>
          )}
        </div>
      </div>

      {/* Transactions */}
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-2xl mb-2">📅</p>
          <p className="text-sm">No transactions on this day</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <div key={t.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center
                  justify-center text-white text-sm font-bold
                  ${t.type === TransactionType.Income
                    ? "bg-green-500" : "bg-red-500"}`}>
                  {t.type === TransactionType.Income ? "↑" : "↓"}
                </span>
                <div>
                  <p className="font-medium text-sm">{t.title}</p>
                  <Badge variant="secondary" className="text-xs">
                    {t.category}
                  </Badge>
                </div>
              </div>
              <span className={`font-bold text-sm
                ${t.type === TransactionType.Income
                  ? "text-green-500" : "text-red-500"}`}>
                {t.type === TransactionType.Income ? "+" : "-"}
                {formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}