"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatMonth } from "@/lib/format";
import { MonthlyReportDto } from "@/types/transaction";
import { useState } from "react";

interface MonthlyBarChartProps {
  data:     MonthlyReportDto[];
  year:     number;
  loading?: boolean;
}

const SKELETON_HEIGHTS = [60, 80, 45, 70, 55, 90, 40, 75, 50, 85, 65, 35];
const SHORT_MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

export default function MonthlyBarChart({
  data,
  year,
  loading = false,
}: MonthlyBarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxAmount = Math.max(
    ...data.map((d) => Math.max(d.totalIncome, d.totalExpense)),
    1
  );

  // Y-axis gridlines at 0%, 25%, 50%, 75%, 100%
  const gridLines = [100, 75, 50, 25, 0];

  if (loading) return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div>
          <div className="h-4 w-36 bg-muted animate-pulse rounded" />
          <div className="h-3 w-20 bg-muted animate-pulse rounded mt-1.5" />
        </div>
        <div className="flex gap-3">
          <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          <div className="h-3 w-16 bg-muted animate-pulse rounded" />
        </div>
      </div>
      <CardContent className="pt-4 px-5 pb-5">
        <div className="relative" style={{ height: 200 }}>
          <div className="absolute inset-0 flex items-end gap-1.5">
            {SKELETON_HEIGHTS.map((h, i) => (
              <div key={i} className="flex-1 flex items-end gap-0.5">
                <div className="flex-1 bg-green-500/20 rounded-t animate-pulse" style={{ height: `${h}%` }} />
                <div className="flex-1 bg-red-500/20 rounded-t animate-pulse" style={{ height: `${h * 0.7}%` }} />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const hoveredData = hovered !== null ? data.find((d) => d.month === hovered) : null;

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div>
          <p className="font-semibold text-sm">Tổng quan theo tháng</p>
          <p className="text-xs text-muted-foreground mt-0.5">Năm {year}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> Thu nhập
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> Chi tiêu
          </span>
        </div>
      </div>

      <CardContent className="pt-4 px-5 pb-5">
        <div className="relative select-none" style={{ height: 200 }}>

          {/* Y-axis grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {gridLines.map((pct) => (
              <div key={pct} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground/50 w-8 text-right shrink-0">
                  {pct > 0 ? formatCurrency((maxAmount * pct) / 100).replace("₫","").trim() : "0"}
                </span>
                <div className="flex-1 border-t border-border/30" />
              </div>
            ))}
          </div>

          {/* Bars — offset to the right of y-axis labels */}
          <div className="absolute inset-0 ml-10 flex items-end gap-1.5">
            {data.map((d) => {
              const incomeH  = Math.max((d.totalIncome  / maxAmount) * 100, d.totalIncome  > 0 ? 2 : 0);
              const expenseH = Math.max((d.totalExpense / maxAmount) * 100, d.totalExpense > 0 ? 2 : 0);
              const isHovered = hovered === d.month;
              const hasData   = d.totalIncome > 0 || d.totalExpense > 0;

              return (
                <div
                  key={d.month}
                  className="flex-1 flex items-end gap-0.5 cursor-pointer"
                  style={{ height: "100%" }}
                  onMouseEnter={() => setHovered(d.month)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="flex-1 flex items-end" style={{ height: "100%" }}>
                    <div
                      className="w-full rounded-t-sm transition-all duration-300"
                      style={{
                        height: `${incomeH}%`,
                        background: isHovered ? "#22c55e" : hasData ? "rgba(34,197,94,0.65)" : "transparent",
                      }}
                    />
                  </div>
                  <div className="flex-1 flex items-end" style={{ height: "100%" }}>
                    <div
                      className="w-full rounded-t-sm transition-all duration-300"
                      style={{
                        height: `${expenseH}%`,
                        background: isHovered ? "#ef4444" : hasData ? "rgba(239,68,68,0.65)" : "transparent",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex gap-1.5 mt-1.5 ml-10">
          {data.map((d) => (
            <div
              key={d.month}
              className={`flex-1 text-center text-[10px] font-medium transition-colors ${
                hovered === d.month ? "text-foreground" : "text-muted-foreground/60"
              }`}
            >
              {SHORT_MONTHS[d.month - 1]}
            </div>
          ))}
        </div>

        {/* Hover detail card */}
        {hoveredData && (
          <div className="mt-4 flex items-center gap-6 px-4 py-3 rounded-xl bg-muted/50 border border-border/50 animate-in fade-in duration-150">
            <p className="font-semibold text-sm shrink-0">{formatMonth(hoveredData.month)}</p>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Thu:</span>
              <span className="font-semibold text-green-500">+{formatCurrency(hoveredData.totalIncome)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Chi:</span>
              <span className="font-semibold text-red-500">−{formatCurrency(hoveredData.totalExpense)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs ml-auto">
              <span className="text-muted-foreground">Số dư:</span>
              <span className={`font-bold ${hoveredData.balance >= 0 ? "text-blue-500" : "text-orange-500"}`}>
                {hoveredData.balance >= 0 ? "+" : "−"}{formatCurrency(Math.abs(hoveredData.balance))}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
