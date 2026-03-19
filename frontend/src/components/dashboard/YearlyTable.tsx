"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MonthlyReportDto } from "@/types/transaction";

interface YearlyTableProps {
  data:     MonthlyReportDto[];
  loading?: boolean;
}

export default function YearlyTable({ data, loading = false }: YearlyTableProps) {
  const totalIncome  = data.reduce((s, d) => s + d.totalIncome,  0);
  const totalExpense = data.reduce((s, d) => s + d.totalExpense, 0);
  const totalBalance = totalIncome - totalExpense;

  if (loading) return (
    <div className="space-y-1.5">
      {Array(13).fill(null).map((_, i) => (
        <div key={i} className={cn("h-9 rounded-lg bg-muted animate-pulse", i === 0 && "opacity-50")} />
      ))}
    </div>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border/60">
          <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground w-28">
            Tháng
          </TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-green-600">
            Thu nhập
          </TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-red-500">
            Chi tiêu
          </TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Số dư
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((d) => {
          const isPositive = d.balance >= 0;
          const hasData    = d.totalIncome > 0 || d.totalExpense > 0;
          return (
            <TableRow key={d.month} className={cn(
              "border-border/40 transition-colors",
              !hasData && "opacity-40"
            )}>
              <TableCell className="font-medium text-sm py-2.5">
                {formatMonth(d.month)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm py-2.5">
                {d.totalIncome > 0
                  ? <span className="text-green-500">+{formatCurrency(d.totalIncome)}</span>
                  : <span className="text-muted-foreground/40">—</span>}
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm py-2.5">
                {d.totalExpense > 0
                  ? <span className="text-red-500">−{formatCurrency(d.totalExpense)}</span>
                  : <span className="text-muted-foreground/40">—</span>}
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm py-2.5">
                {hasData ? (
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                    isPositive
                      ? "bg-green-500/10 text-green-600"
                      : "bg-red-500/10 text-red-500"
                  )}>
                    {isPositive ? "+" : "−"}{formatCurrency(Math.abs(d.balance))}
                  </span>
                ) : (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}

        {/* Total row */}
        <TableRow className="border-t border-border bg-muted/30 font-bold hover:bg-muted/30">
          <TableCell className="text-sm py-3">Tổng năm</TableCell>
          <TableCell className="text-right tabular-nums text-sm py-3 text-green-500">
            +{formatCurrency(totalIncome)}
          </TableCell>
          <TableCell className="text-right tabular-nums text-sm py-3 text-red-500">
            −{formatCurrency(totalExpense)}
          </TableCell>
          <TableCell className="text-right tabular-nums text-sm py-3">
            <span className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
              totalBalance >= 0
                ? "bg-green-500/15 text-green-600"
                : "bg-red-500/15 text-red-500"
            )}>
              {totalBalance >= 0 ? "+" : "−"}{formatCurrency(Math.abs(totalBalance))}
            </span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
