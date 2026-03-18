"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title:   string;
  amount:  number;
  icon:    string;
  variant: "income" | "expense" | "balance";
  loading?: boolean;
}

export default function SummaryCard({
  title,
  amount,
  icon,
  variant,
  loading = false,
}: SummaryCardProps) {
  const colorMap = {
    income:  "text-green-500",
    expense: "text-red-500",
    balance: amount >= 0 ? "text-green-500" : "text-red-500",
  };

  const bgMap = {
    income:  "bg-green-50 border-green-100",
    expense: "bg-red-50 border-red-100",
    balance: amount >= 0
      ? "bg-green-50 border-green-100"
      : "bg-red-50 border-red-100",
  };

  if (loading) return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-8 w-36 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className={cn("border", bgMap[variant])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className={cn("text-2xl font-bold mt-1", colorMap[variant])}>
              {formatCurrency(amount)}
            </p>
          </div>
          <span className="text-4xl">{icon}</span>
        </div>
      </CardContent>
    </Card>
  );
}