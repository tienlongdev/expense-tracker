"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";
import { notificationApi } from "@/lib/notification-api";
import { Notification, NotificationType } from "@/types/notification";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveUiType(type: NotificationType): "info" | "success" | "warning" {
  if (type === 2) return "success"; // SalaryReceived
  if (type === 1) return "warning"; // BudgetAlert
  return "info";                    // WeeklySummary
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "Vừa xong";
  if (mins  < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days  === 1) return "Hôm qua";
  return `${days} ngày trước`;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const typeStyles: Record<"info" | "success" | "warning", string> = {
  info:    "bg-blue-500/10 text-blue-500",
  success: "bg-green-500/10 text-green-500",
  warning: "bg-amber-500/10 text-amber-500",
};

const typeDot: Record<"info" | "success" | "warning", string> = {
  info:    "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-amber-500",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationBell() {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.isRead).length;

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getAll();
      setNotifications(data);
    } catch {
      // Silent fail — bell không crash cả app
    } finally {
      setLoading(false);
    }
  }, []);

  // Load khi mount + poll mỗi 60 giây để unread count luôn mới
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Reload khi mở dropdown
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const markRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await notificationApi.markAsRead(id);
    } catch {
      // Rollback nếu thất bại
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await notificationApi.markAllAsRead();
    } catch {
      fetchNotifications(); // Re-sync nếu thất bại
    }
  };

  // ── Click outside ──────────────────────────────────────────────────────────

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 rounded-full relative"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <Icon
          name="bell"
          variant={unread > 0 ? "solid" : "outline"}
          className="w-4 h-4 transition-all hover:scale-110"
        />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-[100] w-80 max-w-[calc(100vw-1rem)]
          bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden
          animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-200 origin-top-right">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40 bg-card">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-foreground">Thông báo</h3>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {unread}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[70vh] overflow-y-auto divide-y divide-border/30">
            {loading && notifications.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                Đang tải…
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                Không có thông báo
              </div>
            ) : (
              notifications.map((n) => {
                const uiType = resolveUiType(n.type);
                return (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 group transition-all duration-200",
                      !n.isRead ? "bg-primary/5 hover:bg-primary/8" : "hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", typeStyles[uiType])}>
                        <span className={cn("w-2 h-2 rounded-full", typeDot[uiType])} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("text-sm font-medium text-foreground truncate", !n.isRead && "font-semibold")}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border/40 bg-white/5">
            <button
              onClick={fetchNotifications}
              className="text-xs font-medium text-muted-foreground hover:text-primary w-full text-center transition-colors duration-200"
            >
              Làm mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
