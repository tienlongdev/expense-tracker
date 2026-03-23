"use client";

import MonthlyBarChart from "@/components/dashboard/MonthlyBarChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { Button } from "@/components/ui/button";
import { useSummary } from "@/hooks/useSummary";
import { useTransactions } from "@/hooks/useTransactions";
import { useYearlyReport } from "@/hooks/useYearlyReport";
import { formatCurrency, formatMonth } from "@/lib/format";
import Icon from "@/components/ui/Icon";
import { useState } from "react";

export default function DashboardPage() {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const { summary, loading: summaryLoading } = useSummary({
    type: "month",
    year,
    month,
  });

  const { transactions, loading: txLoading } = useTransactions();
  const { report, loading: reportLoading }   = useYearlyReport(year);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Tổng quan tài chính cá nhân
          </p>
        </div>

        {/* Glassy month selector */}
        <div className="flex items-center gap-0.5 rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm shadow-sm px-1 py-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-accent/60" onClick={prevMonth}>
            <Icon name="chevron-left" className="w-4 h-4" />
          </Button>
          <span className="text-sm font-semibold tabular-nums w-28 text-center px-1">
            {formatMonth(month)} {year}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-accent/60" onClick={nextMonth}>
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
              title="Tổng thu"
              value={`+${formatCurrency(summary.totalIncome)}`}
              icon="arrow-down-left"
              theme="emerald"
            />
            <SummaryCard
              title="Tổng chi"
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

      {/* Monthly Bar Chart */}
      <MonthlyBarChart
        data={report}
        year={year}
        loading={reportLoading}
      />

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={transactions}
        loading={txLoading}
      />

    </div>
  );
}