"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/Icon";
import { formatCurrency, formatDate } from "@/lib/format";
import { Transaction, TransactionType } from "@/types/transaction";
import Link from "next/link";

interface RecentTransactionsProps {
  transactions: Transaction[];
  loading?:     boolean;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 px-2">
      <div className="w-9 h-9 rounded-xl bg-muted animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-2/5 rounded bg-muted animate-pulse" />
        <div className="h-2.5 w-1/4 rounded bg-muted animate-pulse" />
      </div>
      <div className="h-3 w-16 rounded bg-muted animate-pulse shrink-0" />
    </div>
  );
}

export default function RecentTransactions({
  transactions,
  loading = false,
}: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5);

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      {/* Header with subtle gradient */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 bg-gradient-to-r from-card via-muted/10 to-card">
        <p className="font-semibold text-sm tracking-tight">Giao dịch gần đây</p>
        <Button variant="ghost" size="sm" asChild className="h-7 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
          <Link href="/transactions">
            Xem tất cả
            <Icon name="arrow-right" className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>

      <CardContent className="p-3">
        {loading ? (
          <div className="divide-y divide-border/20">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm font-medium text-foreground">Chưa có giao dịch nào</p>
            <p className="text-xs mt-1">Hãy thêm giao dịch đầu tiên!</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {recent.map((t) => {
              const isIncome = t.type === TransactionType.Income;
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 py-3 px-2 rounded-xl transition-all duration-200
                    hover:bg-gradient-to-r hover:from-accent/50 hover:to-transparent"
                >
                  {/* Gradient icon */}
                  <div
                    className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
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
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium
                          ${isIncome
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}
                      >
                        {t.categoryName ?? t.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">{formatDate(t.date)}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <span
                    className={`shrink-0 text-sm font-bold tabular-nums
                      ${isIncome ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {isIncome ? "+" : "−"}{formatCurrency(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
