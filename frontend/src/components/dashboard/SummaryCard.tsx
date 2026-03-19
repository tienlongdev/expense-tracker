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

const styles = {
  income: {
    text:  "text-green-500",
    bg:    "bg-green-500/10",
    ring:  "ring-green-500/20",
    bar:   "bg-green-500",
    label: "+",
  },
  expense: {
    text:  "text-red-500",
    bg:    "bg-red-500/10",
    ring:  "ring-red-500/20",
    bar:   "bg-red-500",
    label: "−",
  },
  balance: null, // computed dynamically
} as const;

export default function SummaryCard({
  title,
  amount,
  icon,
  variant,
  loading = false,
}: SummaryCardProps) {
  const isPositive = amount >= 0;
  const s = variant === "balance"
    ? {
        text:  isPositive ? "text-blue-500" : "text-orange-500",
        bg:    isPositive ? "bg-blue-500/10" : "bg-orange-500/10",
        ring:  isPositive ? "ring-blue-500/20" : "ring-orange-500/20",
        bar:   isPositive ? "bg-blue-500" : "bg-orange-500",
        label: isPositive ? "+" : "−",
      }
    : styles[variant];

  if (loading) return (
    <Card className="overflow-hidden">
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
  );

  return (
    <Card className={cn("overflow-hidden ring-1 border-transparent", s.ring)}>
      {/* Accent top bar */}
      <div className={cn("h-0.5 w-full", s.bar)} />
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0", s.bg)}>
            {icon}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className={cn("text-xl font-bold mt-0.5 tabular-nums", s.text)}>
              {s.label}{formatCurrency(Math.abs(amount))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
