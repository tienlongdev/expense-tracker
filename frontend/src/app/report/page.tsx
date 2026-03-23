"use client";

import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import MonthlyBarChart from "@/components/dashboard/MonthlyBarChart";
import YearlyTable from "@/components/dashboard/YearlyTable";
import { Button } from "@/components/ui/button";

import { useSummary } from "@/hooks/useSummary";
import { useTransactionFilter } from "@/hooks/useTransactionFilter";
import { useYearlyReport } from "@/hooks/useYearlyReport";
import { formatCurrency } from "@/lib/format";
import { TransactionType } from "@/types/transaction";
import Icon from "@/components/ui/Icon";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { useState } from "react";

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
          <h1 className="text-xl font-semibold tracking-tight">Báo cáo</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Thống kê tài chính theo năm</p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => setYear((y) => y - 1)}>
            <Icon name="chevron-left" className="w-4 h-4" />
          </Button>
          <span className="text-sm font-semibold w-12 text-center tabular-nums">{year}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => setYear((y) => y + 1)}>
            <Icon name="chevron-right" className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {summaryLoading ? (
          Array(3).fill(null).map((_, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl bg-card p-5 ring-1 ring-border/50 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <>
            <SummaryCard
              title="Tổng thu nhập"
              value={`+${formatCurrency(summary.totalIncome)}`}
              icon="arrow-down-left"
              theme="emerald"
            />

            <SummaryCard
              title="Tổng chi tiêu"
              value={`−${formatCurrency(summary.totalExpense)}`}
              icon="arrow-up-right"
              theme="rose"
            />

            {(() => {
              const pos = summary.balance >= 0;
              return (
                <SummaryCard
                  title="Số dư"
                  value={(pos ? "+" : "−") + formatCurrency(Math.abs(summary.balance))}
                  icon="wallet"
                  theme={pos ? "indigo" : "amber"}
                />
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
      <div className="rounded-2xl overflow-hidden ring-1 ring-border/40 bg-card shadow-sm">
        <div className="px-5 py-4 border-b border-border/40 bg-muted/20">
          <p className="font-semibold text-sm">Chi tiết theo tháng</p>
          <p className="text-xs text-muted-foreground mt-0.5">Năm {year}</p>
        </div>
        <div className="p-0 overflow-x-auto">
          <YearlyTable data={report} loading={reportLoading} />
        </div>
      </div>

    </div>
  );
}
