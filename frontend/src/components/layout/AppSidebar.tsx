"use client";

import NotificationBell from "@/components/layout/NotificationBell";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: "dashboard" as const },
  { href: "/transactions", label: "Giao dịch", icon: "list" as const },
  { href: "/calendar", label: "Lịch", icon: "calendar" as const },
  { href: "/report", label: "Báo cáo", icon: "trending-up" as const },
  { href: "/budget", label: "Ngân sách", icon: "book-open" as const },
  { href: "/debt", label: "Quản lý nợ", icon: "credit-card" as const },
  { href: "/savings", label: "Tiết kiệm", icon: "piggy-bank" as const },
  { href: "/category", label: "Danh mục", icon: "tag" as const },
  { href: "/profile", label: "Profile", icon: "user" as const },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <header className="fixed left-0 right-0 top-0 z-20 flex h-14 items-center justify-between border-b border-sidebar-border/50 bg-sidebar/90 px-4 backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 transition-colors hover:bg-sidebar-accent/70"
          aria-label="Open menu"
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 rounded bg-sidebar-foreground" />
            <span className="block h-0.5 w-5 rounded bg-sidebar-foreground" />
            <span className="block h-0.5 w-5 rounded bg-sidebar-foreground" />
          </div>
        </button>
        <Link href="/" className="flex items-center gap-2 text-base font-bold">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-sm">
            <Icon name="wallet" variant="solid" className="h-3.5 w-3.5 text-white" />
          </div>
          <span>Expense Tracker</span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </header>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full flex-col bg-sidebar transition-all duration-300 ease-in-out lg:relative lg:z-auto",
          "border-r border-sidebar-border/50",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "lg:w-[68px]" : "lg:w-60",
          "w-60"
        )}
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-sidebar-border/50 px-4",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 font-bold text-sidebar-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-md shadow-cyan-500/20">
              <Icon name="wallet" variant="solid" className="h-[17px] w-[17px] text-white" />
            </div>
            {!collapsed && (
              <span className="truncate text-sm font-semibold tracking-tight">
                Expense Tracker
              </span>
            )}
          </Link>

          <button
            onClick={() => setCollapsed((value) => !value)}
            className={cn(
              "hidden h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sidebar-border/60 transition-colors lg:flex",
              "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              collapsed &&
                "absolute -right-3 top-[1.1rem] z-10 border-sidebar-border/60 bg-sidebar shadow-sm"
            )}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <Icon name="chevron-right" className="h-3.5 w-3.5" />
            ) : (
              <Icon name="chevron-left" className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
          {navItems.map(({ href, label, icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-sidebar-primary/15 to-transparent text-sidebar-primary"
                    : "text-sidebar-foreground/55 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-cyan-400 to-indigo-500 shadow-sm" />
                )}
                <Icon
                  name={icon}
                  variant={active ? "solid" : "outline"}
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-all duration-200",
                    active
                      ? "text-sidebar-primary"
                      : "text-sidebar-foreground/55 group-hover:scale-110 group-hover:text-sidebar-foreground"
                  )}
                />
                {!collapsed && <span className="truncate">{label}</span>}

                {collapsed && (
                  <div className="absolute left-full ml-3 hidden whitespace-nowrap rounded-lg border border-border/40 bg-popover px-2.5 py-1.5 text-xs text-popover-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 lg:block">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-sidebar-border/50 p-3">
          {!collapsed ? (
            <div className="space-y-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user?.fullName ?? "Unknown user"}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/45">
                {user?.email ?? ""}
              </p>
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-foreground">
              {user?.fullName?.slice(0, 1).toUpperCase() ?? "U"}
            </div>
          )}

          <div className={cn("flex items-center gap-2", collapsed ? "flex-col" : "justify-between")}>
            {!collapsed && (
              <span className="text-xs font-medium text-sidebar-foreground/40">v1.0.0</span>
            )}
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Icon name="log-out" className="h-3.5 w-3.5" />
              {!collapsed && <span>Đăng xuất</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className="h-14 shrink-0 lg:hidden" />
    </>
  );
}
