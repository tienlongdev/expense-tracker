"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Icon from "@/components/ui/Icon";
import { notificationApi } from "@/lib/notification-api";
import { Notification, NotificationType } from "@/types/notification";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

function resolveUiType(type: NotificationType): "info" | "success" | "warning" {
  if (type === 2) return "success";
  if (type === 1) return "warning";
  return "info";
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days === 1) return "Hôm qua";
  return `${days} ngày trước`;
}

const typeStyles: Record<"info" | "success" | "warning", string> = {
  info: "bg-blue-500/10 text-blue-500",
  success: "bg-green-500/10 text-green-500",
  warning: "bg-amber-500/10 text-amber-500",
};

const typeDot: Record<"info" | "success" | "warning", string> = {
  info: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-amber-500",
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((item) => !item.isRead).length;

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const data = await notificationApi.getAll();
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications, user]);

  useEffect(() => {
    if (open && user) {
      void fetchNotifications();
    }
  }, [open, fetchNotifications, user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );

    try {
      await notificationApi.markAsRead(id);
    } catch {
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: false } : item))
      );
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));

    try {
      await notificationApi.markAllAsRead();
    } catch {
      void fetchNotifications();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-full"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
      >
        <Icon
          name="bell"
          variant={unread > 0 ? "solid" : "outline"}
          className="h-4 w-4 transition-all hover:scale-110"
        />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-[100] mt-2 w-80 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-border/50 bg-card shadow-2xl origin-top-right animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between border-b border-border/40 bg-card px-4 py-3.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Thông báo</h3>
              {unread > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                  {unread}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="max-h-[70vh] divide-y divide-border/30 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Đang tải...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Không có thông báo
              </div>
            ) : (
              notifications.map((item) => {
                const uiType = resolveUiType(item.type);

                return (
                  <button
                    key={item.id}
                    onClick={() => markRead(item.id)}
                    className={cn(
                      "group w-full px-4 py-3 text-left transition-all duration-200",
                      !item.isRead ? "bg-primary/5 hover:bg-primary/8" : "hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          typeStyles[uiType]
                        )}
                      >
                        <span className={cn("h-2 w-2 rounded-full", typeDot[uiType])} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={cn(
                              "truncate text-sm font-medium text-foreground",
                              !item.isRead && "font-semibold"
                            )}
                          >
                            {item.title}
                          </p>
                          {!item.isRead && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {item.message}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                          {formatRelativeTime(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-border/40 bg-white/5 px-4 py-2.5">
            <button
              onClick={() => void fetchNotifications()}
              className="w-full text-center text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              Làm mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
