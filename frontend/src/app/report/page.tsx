"use client";

import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import MonthlyBarChart from "@/components/dashboard/MonthlyBarChart";
import YearlyTable from "@/components/dashboard/YearlyTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSummary } from "@/hooks/useSummary";
import { useTransactionFilter } from "@/hooks/useTransactionFilter";
import { useYearlyReport } from "@/hooks/useYearlyReport";
import { formatCurrency } from "@/lib/format";
import { TransactionType } from "@/types/transaction";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function ReportPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  const { report, loading: reportLoading }     = useYearlyReport(year);
  const { transactions, loading: txLoading }   = useTransactionFilter({
    type: "year", year,
  });
  const { summary, loading: summaryLoading }   = useSummary({
    type: "year", year,
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Report</h1>
          <p className="text-muted-foreground text-sm">
            Yearly financial report
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon"
            onClick={() => setYear((y) => y - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-bold w-16 text-center">{year}</span>
          <Button variant="outline" size="icon"
            onClick={() => setYear((y) => y + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Yearly Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryLoading ? (
          Array(3).fill(null).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))
        ) : (
          <>
            <Card className="bg-green-50 border-green-100">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Income {year}</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-100">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Expense {year}</p>
                <p className="text-2xl font-bold text-red-500 mt-1">
                  {formatCurrency(summary.totalExpense)}
                </p>
              </CardContent>
            </Card>
            <Card className={summary.balance >= 0
              ? "bg-green-50 border-green-100"
              : "bg-red-50 border-red-100"}>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Net Balance {year}</p>
                <p className={`text-2xl font-bold mt-1
                  ${summary.balance >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {formatCurrency(summary.balance)}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Bar Chart */}
      <MonthlyBarChart
        data={report}
        year={year}
        loading={reportLoading}
      />

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryBreakdown
          transactions={transactions}
          type={TransactionType.Income}
          loading={txLoading}
        />
        <CategoryBreakdown
          transactions={transactions}
          type={TransactionType.Expense}
          loading={txLoading}
        />
      </div>

      {/* Yearly Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Monthly Breakdown {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <YearlyTable data={report} loading={reportLoading} />
        </CardContent>
      </Card>

    </div>
  );
}