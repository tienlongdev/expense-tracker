"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Transaction, TransactionType } from "@/types/transaction";

interface CategoryBreakdownProps {
  transactions: Transaction[];
  type:         TransactionType;
  loading?:     boolean;
}

export default function CategoryBreakdown({
  transactions,
  type,
  loading = false,
}: CategoryBreakdownProps) {
  const isIncome = type === TransactionType.Income;

  // Group by category
  const byCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === type)
    .forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
    });

  const sorted = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a);

  const total = sorted.reduce((s, [, v]) => s + v, 0);

  if (loading) return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {isIncome ? "💰 Income" : "💸 Expense"} by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array(5).fill(null).map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {isIncome ? "💰 Income" : "💸 Expense"} by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No data available
          </p>
        ) : (
          <div className="space-y-3">
            {sorted.map(([cat, amount]) => {
              const pct = total > 0 ? (amount / total) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <span className={`text-sm font-semibold
                      ${isIncome ? "text-green-600" : "text-red-500"}`}>
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500
                        ${isIncome ? "bg-green-500" : "bg-red-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {/* Total */}
            <div className="flex justify-between pt-2 border-t text-sm font-semibold">
              <span>Total</span>
              <span className={isIncome ? "text-green-600" : "text-red-500"}>
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}