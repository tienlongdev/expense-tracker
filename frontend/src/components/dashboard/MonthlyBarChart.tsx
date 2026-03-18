"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatMonth } from "@/lib/format";
import { MonthlyReportDto } from "@/types/transaction";

interface MonthlyBarChartProps {
  data:     MonthlyReportDto[];
  year:     number;
  loading?: boolean;
}

const SKELETON_HEIGHTS = [60, 80, 45, 70, 55, 90, 40, 75, 50, 85, 65, 35];

export default function MonthlyBarChart({
  data,
  year,
  loading = false,
}: MonthlyBarChartProps) {
  const maxAmount = Math.max(
    ...data.map((d) => Math.max(d.totalIncome, d.totalExpense)),
    1
  );

  if (loading) return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Overview {year}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* ✅ h-48 trên wrapper ngoài, items-end để bars mọc từ dưới lên */}
        <div className="flex items-end gap-2" style={{ height: "192px" }}>
          {SKELETON_HEIGHTS.map((h, i) => (
            <div key={i} className="flex-1 bg-muted rounded animate-pulse"
              style={{ height: `${h}%` }} />
          ))}
        </div>
        {/* Month labels */}
        <div className="flex gap-2 mt-2">
          {Array(12).fill(null).map((_, i) => (
            <div key={i} className="flex-1 text-center text-xs
              text-muted-foreground">
              {i + 1}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Monthly Overview {year}</CardTitle>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
              Income
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
              Expense
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>

        {/* ✅ Chart area — height cố định bằng px, không dùng h-48 */}
        <div className="flex items-end gap-1" style={{ height: "160px" }}>
          {data.map((d) => {
            const incomeH  = Math.max((d.totalIncome  / maxAmount) * 100, 0);
            const expenseH = Math.max((d.totalExpense / maxAmount) * 100, 0);

            return (
              <div key={d.month}
                className="flex-1 flex items-end gap-0.5 group relative
                  cursor-pointer"
                style={{ height: "100%" }}>

                {/* Income bar */}
                <div className="flex-1 flex items-end" style={{ height: "100%" }}>
                  <div
                    className="w-full bg-green-500 rounded-t-sm
                      transition-all duration-500 group-hover:opacity-70"
                    style={{ height: `${incomeH}%` }}
                  />
                </div>

                {/* Expense bar */}
                <div className="flex-1 flex items-end" style={{ height: "100%" }}>
                  <div
                    className="w-full bg-red-500 rounded-t-sm
                      transition-all duration-500 group-hover:opacity-70"
                    style={{ height: `${expenseH}%` }}
                  />
                </div>

                {/* Tooltip */}
                <div className="hidden group-hover:flex flex-col absolute
                  z-20 bg-white border rounded-lg px-3 py-2 shadow-lg
                  text-xs bottom-full mb-2 left-1/2 -translate-x-1/2
                  pointer-events-none whitespace-nowrap min-w-[120px]">
                  <p className="font-semibold mb-1">{formatMonth(d.month)}</p>
                  <p className="text-green-600">
                    ↑ {formatCurrency(d.totalIncome)}
                  </p>
                  <p className="text-red-500">
                    ↓ {formatCurrency(d.totalExpense)}
                  </p>
                  <p className="font-medium border-t mt-1 pt-1
                    text-foreground">
                    = {formatCurrency(d.totalIncome - d.totalExpense)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Month labels */}
        <div className="flex gap-1 mt-2">
          {data.map((d) => (
            <div key={d.month}
              className="flex-1 text-center text-xs text-muted-foreground">
              {d.month}
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}