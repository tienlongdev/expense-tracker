"use client";

import ThemeToggle from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    List,
    TrendingUp,
    Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import NotificationBell from "./NotificationBell";

const navItems = [
  { href: "/",             label: "Dashboard",    icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: List },
  { href: "/calendar",     label: "Calendar",     icon: CalendarDays },
  { href: "/report",       label: "Report",       icon: TrendingUp },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-20 h-14 flex items-center justify-between px-4 bg-background/80 backdrop-blur border-b border-border">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Open menu"
        >
          <div className="space-y-1.5">
            <span className="block w-5 h-0.5 bg-foreground rounded" />
            <span className="block w-5 h-0.5 bg-foreground rounded" />
            <span className="block w-5 h-0.5 bg-foreground rounded" />
          </div>
        </button>
        <Link href="/" className="flex items-center gap-2 font-bold text-base">
          <Wallet className="w-5 h-5 text-primary" />
          <span>Expense Tracker</span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-40 lg:z-auto h-full flex flex-col",
          "bg-sidebar border-r border-sidebar-border",
          "transition-all duration-300 ease-in-out",
          // Mobile: slide in/out
          "inset-y-0 left-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // Desktop: collapsed or expanded
          collapsed ? "lg:w-[68px]" : "lg:w-60",
          "w-60"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-sidebar-border px-4 shrink-0",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-sidebar-foreground min-w-0"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Wallet className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold truncate">Expense Tracker</span>
            )}
          </Link>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              "hidden lg:flex w-6 h-6 items-center justify-center rounded-full",
              "hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground",
              "transition-colors shrink-0",
              collapsed && "absolute -right-3 top-[1.2rem] bg-background border border-border shadow-sm z-10"
            )}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  "transition-colors duration-150 group relative",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "w-4.5 h-4.5 shrink-0",
                    active ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                  )}
                />
                {!collapsed && <span className="truncate">{label}</span>}

                {/* Tooltip when collapsed (desktop) */}
                {collapsed && (
                  <div className="hidden lg:block absolute left-full ml-3 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-border">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div
          className={cn(
            "border-t border-sidebar-border p-3 flex shrink-0",
            collapsed ? "flex-col items-center gap-2" : "items-center justify-between"
          )}
        >
          {!collapsed && (
            <span className="text-xs text-sidebar-foreground/50 font-medium">
              v1.0.0
            </span>
          )}
          <div className={cn("flex gap-1", collapsed && "flex-col")}>
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Spacer for mobile top bar */}
      <div className="lg:hidden h-14 shrink-0" />
    </>
  );
}
