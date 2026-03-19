"use client";

import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import MonthlyBarChart from "@/components/dashboard/MonthlyBarChart";
import YearlyTable from "@/components/dashboard/YearlyTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSummary } from "@/hooks/useSummary";
import { useTransactionFilter } from "@/hooks/useTransactionFilter";
import { useYearlyReport } from "@/hooks/useYearlyReport";
import { formatCurrency } from "@/lib/format";
import { TransactionType } from "@/types/transaction";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const summaryCards = [
  {
    key: "totalIncome" as const,
    label: "Tổng thu nhập",
    sign: "+",
    accent: { text: "text-green-500", bg: "bg-green-500/10", ring: "ring-green-500/20", bar: "bg-green-500" },
  },
  {
    key: "totalExpense" as const,
    label: "Tổng chi tiêu",
    sign: "−",
    accent: { text: "text-red-500", bg: "bg-red-500/10", ring: "ring-red-500/20", bar: "bg-red-500" },
  },
  {
    key: "balance" as const,
    label: "Số dư",
    sign: null, // dynamic
    accent: null, // dynamic
  },
];

export default function ReportPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  const { report, loading: reportLoading }   = useYearlyReport(year);
  const { transactions, loading: txLoading } = useTransactionFilter({ type: "year", year });
  const { summary, loading: summaryLoading } = useSummary({ type: "year", year });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Báo cáo</h1>
          <p className="text-muted-foreground text-sm">Thống kê tài chính theo năm</p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-card p-1">
          <Button variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => setYear((y) => y - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-bold w-12 text-center tabular-nums">{year}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => setYear((y) => y + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryLoading ? (
          Array(3).fill(null).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-0.5 w-full bg-muted animate-pulse" />
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                    <div className="h-6 w-32 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            {/* Income */}
            <Card className="overflow-hidden ring-1 ring-green-500/20 border-transparent">
              <div className="h-0.5 w-full bg-green-500" />
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center text-xl shrink-0">💰</div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tổng thu nhập</p>
                    <p className="text-xl font-bold text-green-500 mt-0.5 tabular-nums">
                      +{formatCurrency(summary.totalIncome)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expense */}
            <Card className="overflow-hidden ring-1 ring-red-500/20 border-transparent">
              <div className="h-0.5 w-full bg-red-500" />
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center text-xl shrink-0">💸</div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tổng chi tiêu</p>
                    <p className="text-xl font-bold text-red-500 mt-0.5 tabular-nums">
                      −{formatCurrency(summary.totalExpense)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Balance */}
            {(() => {
              const pos = summary.balance >= 0;
              return (
                <Card className={`overflow-hidden ring-1 border-transparent ${pos ? "ring-blue-500/20" : "ring-orange-500/20"}`}>
                  <div className={`h-0.5 w-full ${pos ? "bg-blue-500" : "bg-orange-500"}`} />
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${pos ? "bg-blue-500/10" : "bg-orange-500/10"}`}>
                        {pos ? "📈" : "📉"}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Số dư</p>
                        <p className={`text-xl font-bold mt-0.5 tabular-nums ${pos ? "text-blue-500" : "text-orange-500"}`}>
                          {pos ? "+" : "−"}{formatCurrency(Math.abs(summary.balance))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </>
        )}
      </div>

      {/* Bar Chart */}
      <MonthlyBarChart data={report} year={year} loading={reportLoading} />

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryBreakdown transactions={transactions} type={TransactionType.Income}  loading={txLoading} />
        <CategoryBreakdown transactions={transactions} type={TransactionType.Expense} loading={txLoading} />
      </div>

      {/* Yearly Table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60">
          <p className="font-semibold text-sm">Chi tiết theo tháng</p>
          <p className="text-xs text-muted-foreground mt-0.5">Năm {year}</p>
        </div>
        <CardContent className="p-0">
          <YearlyTable data={report} loading={reportLoading} />
        </CardContent>
      </Card>

    </div>
  );
}
