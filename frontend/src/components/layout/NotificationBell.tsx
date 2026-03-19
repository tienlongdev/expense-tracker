"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
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
    title: "Monthly Budget Alert",
    message: "You have used 80% of your monthly expense budget.",
    time: "2 min ago",
    read: false,
    type: "warning",
  },
  {
    id: "2",
    title: "Salary Received",
    message: "Income of 15,000,000 VND recorded successfully.",
    time: "1 hour ago",
    read: false,
    type: "success",
  },
  {
    id: "3",
    title: "Weekly Summary",
    message: "Your spending this week is 12% lower than last week.",
    time: "Yesterday",
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

  // Close on outside click
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
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
        )}
      </Button>

      {open && (
        <div className="absolute right-0 bottom-auto top-full mt-2 w-80 lg:w-96 z-50
          bg-popover border border-border rounded-xl shadow-xl overflow-hidden
          animate-in fade-in-0 slide-in-from-top-2 duration-150">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-popover-foreground">Notifications</h3>
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
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors group",
                    !n.read && "bg-accent/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon dot */}
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", typeStyles[n.type])}>
                      <span className={cn("w-2 h-2 rounded-full", typeDot[n.type])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("text-sm font-medium text-popover-foreground truncate", !n.read && "font-semibold")}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{n.time}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border bg-muted/30">
            <button className="text-xs text-muted-foreground hover:text-foreground w-full text-center transition-colors">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
