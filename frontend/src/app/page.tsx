"use client";

import { useSummary } from "@/hooks/useSummary";
import { formatCurrency } from "@/lib/format";

export default function Home() {
  const { summary, loading, error } = useSummary();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-destructive">❌ {error}</p>
    </div>
  );

  return (
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold">💰 Expense Tracker</h1>
      <div className="flex justify-center gap-8 mt-8">
        <div>
          <p className="text-sm text-muted-foreground">Total Income</p>
          <p className="text-2xl font-bold text-green-500">
            {formatCurrency(summary.totalIncome)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Expense</p>
          <p className="text-2xl font-bold text-red-500">
            {formatCurrency(summary.totalExpense)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className="text-2xl font-bold">
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </div>
    </div>
  );
}