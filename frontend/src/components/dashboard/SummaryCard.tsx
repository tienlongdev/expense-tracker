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
    text:        "text-emerald-500",
    iconFrom:    "from-emerald-400/25",
    iconTo:      "to-emerald-500/10",
    iconText:    "text-emerald-500",
    barFrom:     "from-emerald-400",
    barTo:       "to-emerald-600",
    shadow:      "shadow-emerald-500/10",
    ring:        "ring-emerald-500/15",
    label:       "+",
  },
  expense: {
    text:        "text-rose-500",
    iconFrom:    "from-rose-400/25",
    iconTo:      "to-rose-500/10",
    iconText:    "text-rose-500",
    barFrom:     "from-rose-400",
    barTo:       "to-rose-600",
    shadow:      "shadow-rose-500/10",
    ring:        "ring-rose-500/15",
    label:       "−",
  },
} as const;

export default function SummaryCard({
  title,
  amount,
  icon,
  variant,
  loading = false,
}: SummaryCardProps) {
  const isPositive = amount >= 0;

  // Derive style object for income/expense; or compute for balance
  const s = variant === "balance"
    ? {
        text:     isPositive ? "text-sky-500"    : "text-amber-500",
        iconFrom: isPositive ? "from-sky-400/25"    : "from-amber-400/25",
        iconTo:   isPositive ? "to-sky-500/10"      : "to-amber-500/10",
        iconText: isPositive ? "text-sky-500"    : "text-amber-500",
        barFrom:  isPositive ? "from-sky-400"    : "from-amber-400",
        barTo:    isPositive ? "to-indigo-500"   : "to-orange-500",
        shadow:   isPositive ? "shadow-sky-500/10"  : "shadow-amber-500/10",
        ring:     isPositive ? "ring-sky-500/15"    : "ring-amber-500/15",
        label:    isPositive ? "+"               : "−",
      }
    : styles[variant];

  if (loading) return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            <div className="h-7 w-32 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card
      className={cn(
        "overflow-hidden ring-1 border-transparent",
        "transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5",
        "shadow-lg",
        s.ring,
        s.shadow,
      )}
    >
      {/* Gradient top accent bar */}
      <div className={cn("h-[2px] w-full bg-gradient-to-r", s.barFrom, s.barTo)} />

      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          {/* Gradient icon container */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0",
              "bg-gradient-to-br",
              s.iconFrom,
              s.iconTo,
            )}
          >
            <span className="text-xl">{icon}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              {title}
            </p>
            <p className={cn("text-2xl font-bold mt-1 tabular-nums tracking-tight", s.text)}>
              {s.label}{formatCurrency(Math.abs(amount))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
