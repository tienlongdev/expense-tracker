"use client";

import ThemeToggle from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import NotificationBell from "./NotificationBell";

const navItems = [
  { href: "/",             label: "Dashboard",    icon: "dashboard"  as const },
  { href: "/transactions", label: "Giao dịch",    icon: "list"       as const },
  { href: "/calendar",     label: "Lịch",         icon: "calendar"   as const },
  { href: "/report",       label: "Báo cáo",      icon: "trending-up" as const },
  { href: "/budget",       label: "Ngân sách",    icon: "book-open"  as const },
  { href: "/debt",         label: "Quản lý nợ",   icon: "credit-card" as const },
  { href: "/savings",      label: "Tiết kiệm",    icon: "piggy-bank" as const },
  { href: "/category",     label: "Danh mục",     icon: "tag"        as const },
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
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-20 h-14 flex items-center justify-between px-4 bg-sidebar/90 backdrop-blur-xl border-b border-sidebar-border/50">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-sidebar-accent/70 transition-colors"
          aria-label="Open menu"
        >
          <div className="space-y-1.5">
            <span className="block w-5 h-0.5 bg-sidebar-foreground rounded" />
            <span className="block w-5 h-0.5 bg-sidebar-foreground rounded" />
            <span className="block w-5 h-0.5 bg-sidebar-foreground rounded" />
          </div>
        </button>
        <Link href="/" className="flex items-center gap-2 font-bold text-base">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-sm">
            <Icon name="wallet" variant="solid" className="w-3.5 h-3.5 text-white" />
          </div>
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
          "bg-sidebar border-r border-sidebar-border/50",
          "transition-all duration-300 ease-in-out",
          "inset-y-0 left-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "lg:w-[68px]" : "lg:w-60",
          "w-60"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "h-14 flex items-center border-b border-sidebar-border/50 px-4 shrink-0",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-sidebar-foreground min-w-0"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20">
              <Icon name="wallet" variant="solid" className="w-[17px] h-[17px] text-white" />
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold truncate tracking-tight">Expense Tracker</span>
            )}
          </Link>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              "hidden lg:flex w-6 h-6 items-center justify-center rounded-full",
              "hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground",
              "transition-colors shrink-0 border border-sidebar-border/60",
              collapsed && "absolute -right-3 top-[1.1rem] bg-sidebar border border-sidebar-border/60 shadow-sm z-10"
            )}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <Icon name="chevron-right" className="w-3.5 h-3.5" />
            ) : (
              <Icon name="chevron-left" className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {navItems.map(({ href, label, icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium relative",
                  "transition-all duration-200 group",
                  active
                    ? "bg-gradient-to-r from-sidebar-primary/15 to-transparent text-sidebar-primary"
                    : "text-sidebar-foreground/55 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                )}
              >
                {/* Active left accent bar */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-cyan-400 to-indigo-500 shadow-sm" />
                )}
                <Icon
                  name={icon}
                  variant={active ? "solid" : "outline"}
                  className={cn(
                    "w-[18px] h-[18px] shrink-0 transition-all duration-200",
                    active
                      ? "text-sidebar-primary"
                      : "text-sidebar-foreground/55 group-hover:text-sidebar-foreground group-hover:scale-110"
                  )}
                />
                {!collapsed && <span className="truncate">{label}</span>}

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="hidden lg:block absolute left-full ml-3 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-border/40 z-50">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div
          className={cn(
            "border-t border-sidebar-border/50 p-3 flex shrink-0",
            collapsed ? "flex-col items-center gap-2" : "items-center justify-between"
          )}
        >
          {!collapsed && (
            <span className="text-xs text-sidebar-foreground/40 font-medium">v1.0.0</span>
          )}
          {collapsed && (
            <span className="text-[10px] text-sidebar-foreground/40 font-medium">v1</span>
          )}
        </div>
      </aside>

      {/* Spacer for mobile top bar */}
      <div className="lg:hidden h-14 shrink-0" />
    </>
  );
}
