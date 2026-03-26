/**
 * Icon.tsx — Centralized icon wrapper using @heroicons/react
 *
 * Usage:
 *   <Icon name="home" />                    → outline, default size
 *   <Icon name="bell" variant="solid" />    → solid style
 *   <Icon name="plus" className="w-5 h-5" />
 */

import * as OutlineIcons from "@heroicons/react/24/outline";
import * as SolidIcons from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

// ── Icon name registry ───────────────────────────────────────────────────────
export const iconMap = {
  // Navigation / Sidebar
  "home":               { outline: OutlineIcons.HomeIcon,                solid: SolidIcons.HomeIcon },
  "dashboard":          { outline: OutlineIcons.Squares2X2Icon,          solid: SolidIcons.Squares2X2Icon },
  "list":               { outline: OutlineIcons.ListBulletIcon,          solid: SolidIcons.ListBulletIcon },
  "calendar":           { outline: OutlineIcons.CalendarDaysIcon,        solid: SolidIcons.CalendarDaysIcon },
  "trending-up":        { outline: OutlineIcons.ArrowTrendingUpIcon,     solid: SolidIcons.ArrowTrendingUpIcon },
  "book-open":          { outline: OutlineIcons.BookOpenIcon,            solid: SolidIcons.BookOpenIcon },
  "credit-card":        { outline: OutlineIcons.CreditCardIcon,          solid: SolidIcons.CreditCardIcon },
  "piggy-bank":         { outline: OutlineIcons.BanknotesIcon,           solid: SolidIcons.BanknotesIcon },
  "tag":                { outline: OutlineIcons.TagIcon,                 solid: SolidIcons.TagIcon },
  "inbox":              { outline: OutlineIcons.InboxIcon,               solid: SolidIcons.InboxIcon },
  "wallet":             { outline: OutlineIcons.WalletIcon,              solid: SolidIcons.WalletIcon },
  "settings":           { outline: OutlineIcons.Cog6ToothIcon,           solid: SolidIcons.Cog6ToothIcon },
  "user":               { outline: OutlineIcons.UserCircleIcon,          solid: SolidIcons.UserCircleIcon },
  "log-out":            { outline: OutlineIcons.ArrowLeftStartOnRectangleIcon, solid: SolidIcons.ArrowLeftStartOnRectangleIcon },

  // Actions
  "plus":               { outline: OutlineIcons.PlusIcon,                solid: SolidIcons.PlusIcon },
  "pencil":             { outline: OutlineIcons.PencilSquareIcon,        solid: SolidIcons.PencilSquareIcon },
  "trash":              { outline: OutlineIcons.TrashIcon,               solid: SolidIcons.TrashIcon },
  "copy":               { outline: OutlineIcons.DocumentDuplicateIcon,   solid: SolidIcons.DocumentDuplicateIcon },
  "refresh":            { outline: OutlineIcons.ArrowPathIcon,           solid: SolidIcons.ArrowPathIcon },
  "check":              { outline: OutlineIcons.CheckIcon,               solid: SolidIcons.CheckIcon },
  "x":                  { outline: OutlineIcons.XMarkIcon,               solid: SolidIcons.XMarkIcon },

  // Chevrons / Navigation arrows
  "chevron-left":       { outline: OutlineIcons.ChevronLeftIcon,         solid: SolidIcons.ChevronLeftIcon },
  "chevron-right":      { outline: OutlineIcons.ChevronRightIcon,        solid: SolidIcons.ChevronRightIcon },
  "chevron-up":         { outline: OutlineIcons.ChevronUpIcon,           solid: SolidIcons.ChevronUpIcon },
  "chevron-down":       { outline: OutlineIcons.ChevronDownIcon,         solid: SolidIcons.ChevronDownIcon },
  "arrow-right":        { outline: OutlineIcons.ArrowRightIcon,          solid: SolidIcons.ArrowRightIcon },
  "arrow-up":           { outline: OutlineIcons.ArrowUpIcon,             solid: SolidIcons.ArrowUpIcon },
  "arrow-down":         { outline: OutlineIcons.ArrowDownIcon,           solid: SolidIcons.ArrowDownIcon },
  "arrow-down-left":    { outline: OutlineIcons.ArrowDownLeftIcon,       solid: SolidIcons.ArrowDownLeftIcon },
  "arrow-up-right":     { outline: OutlineIcons.ArrowUpRightIcon,        solid: SolidIcons.ArrowUpRightIcon },
  "arrow-up-circle":    { outline: OutlineIcons.ArrowUpCircleIcon,       solid: SolidIcons.ArrowUpCircleIcon },
  "arrow-down-circle":  { outline: OutlineIcons.ArrowDownCircleIcon,     solid: SolidIcons.ArrowDownCircleIcon },

  // Status / Alerts
  "bell":               { outline: OutlineIcons.BellIcon,                solid: SolidIcons.BellIcon },
  "alert-triangle":     { outline: OutlineIcons.ExclamationTriangleIcon, solid: SolidIcons.ExclamationTriangleIcon },

  // Theme
  "sun":                { outline: OutlineIcons.SunIcon,                 solid: SolidIcons.SunIcon },
  "moon":               { outline: OutlineIcons.MoonIcon,                solid: SolidIcons.MoonIcon },

  // History / Clock
  "history":            { outline: OutlineIcons.ClockIcon,               solid: SolidIcons.ClockIcon },

  // Charts / Dashboard
  "chart-bar":          { outline: OutlineIcons.ChartBarIcon,            solid: SolidIcons.ChartBarIcon },
  "chart-pie":          { outline: OutlineIcons.ChartPieIcon,            solid: SolidIcons.ChartPieIcon },

  // Budget
  "adjustments":        { outline: OutlineIcons.AdjustmentsHorizontalIcon, solid: SolidIcons.AdjustmentsHorizontalIcon },
} as const;

export type IconName = keyof typeof iconMap;
export type IconVariant = "outline" | "solid";

interface IconProps {
  name: IconName;
  variant?: IconVariant;
  className?: string;
  "aria-label"?: string;
}

export default function Icon({
  name,
  variant = "outline",
  className,
  "aria-label": ariaLabel,
}: IconProps) {
  const set = iconMap[name];
  const Component = variant === "solid" ? set.solid : set.outline;

  return (
    <Component
      className={cn("w-5 h-5", className)}
      aria-label={ariaLabel}
    />
  );
}
