import { cn } from "@/lib/utils";
import Icon, { IconName } from "@/components/ui/Icon";
import { ReactNode } from "react";

type CardTheme = "emerald" | "rose" | "blue" | "indigo" | "amber" | "orange" | "cyan" | "teal" | "default";

interface SummaryCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  icon: IconName;
  theme?: CardTheme;
  className?: string;
  valueClassName?: string;
}

const themeStyles: Record<CardTheme, { iconBg: string; iconText: string; valueText: string }> = {
  emerald: {
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    iconText: "text-emerald-600 dark:text-emerald-400",
    valueText: "text-emerald-600 dark:text-emerald-400",
  },
  rose: {
    iconBg: "bg-rose-500/10 dark:bg-rose-500/20",
    iconText: "text-rose-600 dark:text-rose-400",
    valueText: "text-rose-600 dark:text-rose-400",
  },
  blue: {
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    iconText: "text-blue-600 dark:text-blue-400",
    valueText: "text-blue-600 dark:text-blue-400",
  },
  indigo: {
    iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    iconText: "text-indigo-600 dark:text-indigo-400",
    valueText: "text-indigo-600 dark:text-indigo-400",
  },
  amber: {
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    iconText: "text-amber-600 dark:text-amber-400",
    valueText: "text-amber-600 dark:text-amber-400",
  },
  orange: {
    iconBg: "bg-orange-500/10 dark:bg-orange-500/20",
    iconText: "text-orange-600 dark:text-orange-400",
    valueText: "text-orange-600 dark:text-orange-400",
  },
  cyan: {
    iconBg: "bg-cyan-500/10 dark:bg-cyan-500/20",
    iconText: "text-cyan-600 dark:text-cyan-400",
    valueText: "text-cyan-600 dark:text-cyan-400",
  },
  teal: {
    iconBg: "bg-teal-500/10 dark:bg-teal-500/20",
    iconText: "text-teal-600 dark:text-teal-400",
    valueText: "text-teal-600 dark:text-teal-400",
  },
  default: {
    iconBg: "bg-muted",
    iconText: "text-foreground",
    valueText: "text-foreground",
  },
};

export function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  theme = "default",
  className,
  valueClassName,
}: SummaryCardProps) {
  const styles = themeStyles[theme];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card p-5 ring-1 ring-border/50 shadow-sm transition-all duration-200 hover:shadow-md hover:ring-border/80",
        className
      )}
    >
      <div className="flex items-center gap-4 relative z-10">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 hover:scale-105",
            styles.iconBg
          )}
        >
          <Icon name={icon} variant="solid" className={cn("h-6 w-6", styles.iconText)} />
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {title}
          </p>
          <div
            className={cn(
              "text-2xl font-bold tracking-tight tabular-nums truncate",
              styles.valueText,
              valueClassName
            )}
          >
            {value}
          </div>
          {subtitle && (
            <div className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wide truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
