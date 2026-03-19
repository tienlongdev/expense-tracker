"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { Transaction, TransactionType } from "@/types/transaction";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecentTransactionsProps {
  transactions: Transaction[];
  loading?:     boolean;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
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
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <p className="font-semibold text-sm">Giao dịch gần đây</p>
        <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground">
          <Link href="/transactions">
            Xem tất cả <ArrowRight className="w-3 h-3" />
          </Link>
        </Button>
      </div>

      <CardContent className="p-3">
        {loading ? (
          <div className="divide-y divide-border/40">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-muted-foreground">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-sm font-medium text-foreground">Chưa có giao dịch nào</p>
            <p className="text-xs mt-1">Hãy thêm giao dịch đầu tiên!</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {recent.map((t) => {
              const isIncome = t.type === TransactionType.Income;
              return (
                <div key={t.id} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-accent/40 transition-colors">
                  {/* Icon */}
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${isIncome ? "bg-green-500/15 text-green-500" : "bg-red-500/15 text-red-500"}`}>
                    {isIncome ? "↑" : "↓"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium
                        ${isIncome ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                        {t.categoryName ?? t.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(t.date)}</span>
                    </div>
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
      </CardContent>
    </Card>
  );
}
