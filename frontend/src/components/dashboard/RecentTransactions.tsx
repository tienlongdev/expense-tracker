"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { Transaction, TransactionType } from "@/types/transaction";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecentTransactionsProps {
  transactions: Transaction[];
  loading?:     boolean;
}

export default function RecentTransactions({
  transactions,
  loading = false,
}: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/transactions">
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((t) => {
              const isIncome = t.type === TransactionType.Income;
              return (
                <div key={t.id}
                  className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center
                      justify-center text-white text-sm
                      ${isIncome ? "bg-green-500" : "bg-red-500"}`}>
                      {isIncome ? "↑" : "↓"}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{t.title}</p>
                      <div className="flex gap-2 items-center">
                        <Badge variant="secondary" className="text-xs">
                          {t.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(t.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm
                    ${isIncome ? "text-green-500" : "text-red-500"}`}>
                    {isIncome ? "+" : "-"}{formatCurrency(t.amount)}
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