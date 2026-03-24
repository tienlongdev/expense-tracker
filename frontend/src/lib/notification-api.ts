import { Notification } from "@/types/notification";
import { api } from "./api";

export const notificationApi = {
  getAll: (onlyUnread = false) =>
    api.get<Notification[]>(
      `/api/notification${onlyUnread ? "?onlyUnread=true" : ""}`
    ),

  getUnreadCount: () =>
    api.get<{ count: number }>("/api/notification/unread-count"),

  markAsRead: (id: string) =>
    api.patch<void>(`/api/notification/${id}/read`),

  markAllAsRead: () =>
    api.patch<void>("/api/notification/read-all"),

  delete: (id: string) =>
    api.delete<void>(`/api/notification/${id}`),
};
