import { http } from "@/lib/http";

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  diagram_id?: number;
  project_id?: number;
  is_read: boolean;
  created_at: string;
}

export async function getNotificationsApi(): Promise<Notification[]> {
  const res = await http.get("/api/notifications");
  return res.data.data;
}

export async function getUnreadCountApi(): Promise<number> {
  const res = await http.get("/api/notifications/unread-count");
  return res.data.data.count;
}

export async function markNotificationReadApi(notificationID: number) {
  const res = await http.patch(`/api/notifications/${notificationID}/read`);
  return res.data;
}

export async function markAllNotificationsReadApi() {
  const res = await http.patch("/api/notifications/read-all");
  return res.data;
}