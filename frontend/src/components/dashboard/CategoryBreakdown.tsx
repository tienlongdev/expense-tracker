"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Transaction, TransactionType } from "@/types/transaction";

interface CategoryBreakdownProps {
  transactions: Transaction[];
  type:         TransactionType;
  loading?:     boolean;
}

// Palette for distinct category colors
const COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-cyan-500",
  "bg-teal-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
];

const COLORS_TEXT = [
  "text-violet-500",
  "text-blue-500",
  "text-cyan-500",
  "text-teal-500",
  "text-amber-500",
  "text-orange-500",
  "text-pink-500",
  "text-indigo-500",
];

export default function CategoryBreakdown({
  transactions,
  type,
  loading = false,
}: CategoryBreakdownProps) {
  const isIncome = type === TransactionType.Income;

  // Group by categoryName (prefer) or category
  const byCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === type)
    .forEach((t) => {
      const key = t.categoryName ?? t.category;
      byCategory[key] = (byCategory[key] ?? 0) + t.amount;
    });

  const sorted = Object.entries(byCategory).sort(([, a], [, b]) => b - a);
  const total  = sorted.reduce((s, [, v]) => s + v, 0);

  const accentColor = isIncome ? "text-green-500" : "text-red-500";
  const barColor    = isIncome ? "bg-green-500"   : "bg-red-500";

  if (loading) return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div className="h-4 w-40 bg-muted animate-pulse rounded" />
        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
      </div>
      <CardContent className="px-5 pt-4 pb-5 space-y-4">
        {Array(5).fill(null).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-1.5 w-full bg-muted animate-pulse rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <p className="font-semibold text-sm">
          {isIncome ? "Thu nhập" : "Chi tiêu"} theo danh mục
        </p>
        {sorted.length > 0 && (
          <span className={`text-xs font-bold tabular-nums ${accentColor}`}>
            {formatCurrency(total)}
          </span>
        )}
      </div>

      <CardContent className="px-5 pt-4 pb-5">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground">
            <p className="text-2xl mb-2">{isIncome ? "💰" : "💸"}</p>
            <p className="text-sm">Chưa có dữ liệu</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {sorted.map(([cat, amount], idx) => {
              const pct      = total > 0 ? (amount / total) * 100 : 0;
              const colorBg  = COLORS[idx % COLORS.length];
              const colorTxt = COLORS_TEXT[idx % COLORS_TEXT.length];

              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${colorBg}`} />
                      <span className="text-sm font-medium truncate">{cat}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <span className={`text-sm font-semibold tabular-nums shrink-0 ml-3 ${colorTxt}`}>
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colorBg}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Total */}
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-border/50">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tổng</span>
              <span className={`text-sm font-bold tabular-nums ${accentColor}`}>
                {isIncome ? "+" : "−"}{formatCurrency(total)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
