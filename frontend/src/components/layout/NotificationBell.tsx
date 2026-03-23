"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Cảnh báo ngân sách",
    message: "Bạn đã dùng 80% ngân sách chi tiêu tháng này.",
    time: "2 phút trước",
    read: false,
    type: "warning",
  },
  {
    id: "2",
    title: "Nhận lương thành công",
    message: "Đã ghi nhận thu nhập 15.000.000 đ.",
    time: "1 giờ trước",
    read: false,
    type: "success",
  },
  {
    id: "3",
    title: "Tổng kết tuần",
    message: "Chi tiêu tuần này thấp hơn tuần trước 12%.",
    time: "Hôm qua",
    read: true,
    type: "info",
  },
];

const typeStyles: Record<Notification["type"], string> = {
  info:    "bg-blue-500/10 text-blue-500",
  success: "bg-green-500/10 text-green-500",
  warning: "bg-amber-500/10 text-amber-500",
};

const typeDot: Record<Notification["type"], string> = {
  info:    "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-amber-500",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <div className="absolute right-0 top-full mt-2 z-[60] w-80 max-w-[calc(100vw-1rem)]
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
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                Không có thông báo
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 group transition-all duration-200",
                    !n.read ? "bg-primary/5 hover:bg-primary/8" : "hover:bg-white/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", typeStyles[n.type])}>
                      <span className={cn("w-2 h-2 rounded-full", typeDot[n.type])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("text-sm font-medium text-foreground truncate", !n.read && "font-semibold")}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{n.time}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border/40 bg-white/5">
            <button className="text-xs font-medium text-muted-foreground hover:text-primary w-full text-center transition-colors duration-200">
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
