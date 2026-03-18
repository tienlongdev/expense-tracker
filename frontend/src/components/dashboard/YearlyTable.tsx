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
    <div className="space-y-2">
      {Array(13).fill(null).map((_, i) => (
        <div key={i} className="h-10 bg-muted rounded animate-pulse" />
      ))}
    </div>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Month</TableHead>
          <TableHead className="text-right text-green-600">Income</TableHead>
          <TableHead className="text-right text-red-500">Expense</TableHead>
          <TableHead className="text-right">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((d) => (
          <TableRow key={d.month}>
            <TableCell className="font-medium">
              {formatMonth(d.month)}
            </TableCell>
            <TableCell className="text-right text-green-600">
              {d.totalIncome > 0 ? `+${formatCurrency(d.totalIncome)}` : "—"}
            </TableCell>
            <TableCell className="text-right text-red-500">
              {d.totalExpense > 0 ? `-${formatCurrency(d.totalExpense)}` : "—"}
            </TableCell>
            <TableCell className={cn(
              "text-right font-semibold",
              d.balance >= 0 ? "text-green-600" : "text-red-500"
            )}>
              {formatCurrency(d.balance)}
            </TableCell>
          </TableRow>
        ))}

        {/* Total row */}
        <TableRow className="border-t-2 font-bold bg-muted/50">
          <TableCell>Total</TableCell>
          <TableCell className="text-right text-green-600">
            +{formatCurrency(totalIncome)}
          </TableCell>
          <TableCell className="text-right text-red-500">
            -{formatCurrency(totalExpense)}
          </TableCell>
          <TableCell className={cn(
            "text-right font-bold",
            totalBalance >= 0 ? "text-green-600" : "text-red-500"
          )}>
            {formatCurrency(totalBalance)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}