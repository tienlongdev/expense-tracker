"use client";

import MonthlyBarChart from "@/components/dashboard/MonthlyBarChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import SummaryCard from "@/components/dashboard/SummaryCard";
import { Button } from "@/components/ui/button";
import { useSummary } from "@/hooks/useSummary";
import { useTransactions } from "@/hooks/useTransactions";
import { useYearlyReport } from "@/hooks/useYearlyReport";
import { formatMonth } from "@/lib/format";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Tổng quan tài chính cá nhân
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-semibold tabular-nums w-28 text-center">
            {formatMonth(month)} {year}
          </span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Tổng thu"
          amount={summary.totalIncome}
          icon="💰"
          variant="income"
          loading={summaryLoading}
        />
        <SummaryCard
          title="Tổng chi"
          amount={summary.totalExpense}
          icon="💸"
          variant="expense"
          loading={summaryLoading}
        />
        <SummaryCard
          title="Số dư"
          amount={summary.balance}
          icon="🏦"
          variant="balance"
          loading={summaryLoading}
        />
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